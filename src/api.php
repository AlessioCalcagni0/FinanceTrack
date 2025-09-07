<?php

require __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$host = $_ENV["DB_HOST"];
$port = $_ENV["DB_PORT"];
$dbname = $_ENV["DB_NAME"];
$user = $_ENV["DB_USER"];
$pass = $_ENV["DB_PASS"];

try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Errore connessione DB: " . $e->getMessage()]);
    exit;
}

// Funzione helper per leggere body JSON
function getJsonInput() {
    $data = file_get_contents("php://input");
    return json_decode($data, true);
}

$path = $_GET["path"] ?? "";

/* -------------------------------
   API: GET /api/spese?periodo=...
-------------------------------- */
if ($path === "api/spese") {
    $periodo = $_GET["periodo"] ?? "anno";

    switch ($periodo) {
        case "mese":
            $sql = "
                SELECT category , SUM(amount) AS totale
                FROM transactions
                WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
                  AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
                  AND type='outcome'
                GROUP BY category ";
            break;
        case "settimana":
            $sql = "
                SELECT category , SUM(amount) AS totale
                FROM transactions
                WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
                  AND EXTRACT(WEEK FROM date) = EXTRACT(WEEK FROM CURRENT_DATE)
                  AND type='outcome'
                GROUP BY category ";
            break;
        default: // anno
            $sql = "
                SELECT category , SUM(amount) AS totale
                FROM transactions
                WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
                AND type='outcome'
                GROUP BY category ";
    }

    try {
        $stmt = $pdo->query($sql);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Errore query: " . $e->getMessage()]);
    }
    exit;
}

/* -------------------------------
   API: GET /categories
-------------------------------- */
if ($path === "categories") {
    try {
        $stmt = $pdo->query("SELECT name, path, limite, spent FROM categories ORDER BY id");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Errore recupero categorie: " . $e->getMessage()]);
    }
    exit;
}

/* -------------------------------
   API: POST /addCategory
-------------------------------- */
if ($path === "addCategory" && $_SERVER["REQUEST_METHOD"] === "POST") {
    $data = getJsonInput();

    $name = $data["name"] ?? null;
    $pathImg       = $data["path"] ?? null;
    $limite        = $data["limite"] ?? null;
    $spent         = $data["spent"] ?? 0;

    if (!$name || !$pathImg || $limite === null) {
        http_response_code(400);
        echo json_encode(["error" => "Dati mancanti"]);
        exit;
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO categories (name, path, limite, spent) 
                               VALUES (:name, :path, :limite, :spent) RETURNING *");
        $stmt->execute([
            ":name" => $name,
            ":path" => $pathImg,
            ":limite" => $limite,
            ":spent" => $spent
        ]);
        $newCategory = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($spent > 0) {
            $stmt2 = $pdo->prepare("INSERT INTO spese (categoria, importo, data) VALUES (:cat, :imp, NOW()) RETURNING *");
            $stmt2->execute([
                ":cat" => $name,
                ":imp" => $spent
            ]);
        }

        $pdo->commit();
        echo json_encode($newCategory);
    } catch(PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["error" => "Errore inserimento: " . $e->getMessage()]);
    }
    exit;
}


if ($path === "income_sum") {
    try {
        $stmt = $pdo->query("SELECT SUM(amount) AS totale FROM transactions WHERE type='income' group by id");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($result);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Errore query: " . $e->getMessage()]);
    }
    exit;
}

if ($path === "spent_sum") {
    try {
        $stmt = $pdo->query("SELECT SUM(amount) AS totale FROM transactions WHERE type='outcome' group by id");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($result);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Errore query: " . $e->getMessage()]);
    }
    exit;
}

if ($path === "today_transactions") {
    try {
        // Income con path fisso ./Cash.png
        $sql = "SELECT s.type AS tipo, 
                        s.amount AS importo, 
                        s.date, 
                        s.time AS orario,
                        s.name AS nome, 
                        c.path AS path
                    FROM transactions s
                    JOIN categories c ON LOWER(TRIM(s.category)) = LOWER(TRIM(c.name))
                    WHERE s.date::date = CURRENT_DATE 
                    ORDER BY s.time ASC
        ";

        // Unione e ordinamento basato sul timestamp completo
        $stmt = $pdo->query($sql );

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($rows ?: []); 

    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

if ($path === "last_week_transactions") {
    try {
        // Spese con join su categories
        $sql = "SELECT 
                    s.id, 
                    s.type AS tipo,             
                    s.amount AS importo,       
                    s.date AS data,           
                    s.name AS nome, 
                    c.path AS path
                FROM transactions s
                JOIN categories c ON s.category = c.name
                WHERE s.date::date BETWEEN (CURRENT_DATE - INTERVAL '7 days') 
                                    AND (CURRENT_DATE - INTERVAL '1 day') 
                ORDER BY s.date ASC";

   

        // Unione e ordinamento per data
        $stmt = $pdo->query($sql);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($rows ?: []); 
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]); 
    }
    exit;
}


if ($path === "accounts") {
    try {
        $sql = "
            SELECT 
                id,
                name,
                type,
                balance,
                path,
                TO_CHAR(last_sync, 'YYYY-MM-DD') AS last_sync
            FROM account
            ORDER BY name ASC
        ";
        $stmt = $pdo->query($sql);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows ?: []);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

if ($path === "add_account") {
    header('Content-Type: application/json'); // Assicura che il client riceva JSON
    try {
        // Legge i dati JSON inviati dal client
        $data = json_decode(file_get_contents("php://input"), true);

        // Controlla i campi obbligatori
        if (!$data || !isset($data["name"]) || !isset($data["type"]) || !isset($data["path"])) {
            throw new Exception("Campi obbligatori mancanti");
        }

        $last_sync = date("Y-m-d H:i:s"); // Data/ora corrente
        $balance = isset($data["balance"]) ? $data["balance"] : 0;

        // Inserimento in DB
        $stmt = $pdo->prepare("
            INSERT INTO account (name, type, path, balance, last_sync)
            VALUES (:name, :type, :path, :balance, :last_sync)
            RETURNING id
        ");

        $stmt->execute([
            ":name" => $data["name"],
            ":type" => $data["type"],
            ":path" => $data["path"],
            ":balance" => $balance,
            ":last_sync" => $last_sync
        ]);

        $id = $stmt->fetchColumn(); // Ottiene l'ID generato
        echo json_encode(["success" => true, "id" => $id, "last_sync" => $last_sync]);

    } catch (Exception $e) {
        // Risposta JSON in caso di errore
        http_response_code(400);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit;
}

if ($path === "update_account") {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || !isset($data["id"])) throw new Exception("ID mancante");

        $fields = [];
        $params = [":id"=>$data["id"]];
        if (isset($data["name"])) { $fields[]="name=:name"; $params[":name"]=$data["name"]; }
        if (isset($data["type"])) { $fields[]="type=:type"; $params[":type"]=$data["type"]; }
        if (isset($data["path"])) { $fields[]="path=:path"; $params[":path"]=$data["path"]; }

        if(empty($fields)) throw new Exception("Nessun campo da aggiornare");

        $sql = "UPDATE account SET ".implode(", ", $fields).", last_sync=NOW() WHERE id=:id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode(["success"=>true]);
    } catch(Exception $e) {
        http_response_code(400);
        echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

if ($path === "delete_account") {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || !isset($data["id"])) {
            throw new Exception("ID mancante");
        }

        $stmt = $pdo->prepare("DELETE FROM account WHERE id = :id");
        $stmt->execute([":id" => $data["id"]]);

        if ($stmt->rowCount() === 0) {
            throw new Exception("Account non trovato o già eliminato");
        }

        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}


/* -------------------------------
   API: POST /save_transaction (PER ADD_TRANSACTION)
-------------------------------- */
if ($path === "save_transaction" && $_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    $total = isset($data['total']) ? floatval($data['total']) : 0;
    $uncat = $data['uncat'] ?? false;
    $transactions = $data['transactions'] ?? [];

    $exceededCategories = [];

    try {
        $pdo->beginTransaction();
        $nowDate = date("Y-m-d");
        $nowTime = date("H:i:s");

        if ($uncat) {
            // Inserimento transazione non categorizzata
            $stmt = $pdo->prepare("INSERT INTO transactions (type, category, amount, date, name, time, wallet_id) VALUES (?, ?, ?, ?, ?, ?, ?) ");
            $stmt->execute(["outcome","Uncategorized", $total, $nowDate, "Cash", $nowTime, 1]);
        } else {
            foreach ($transactions as $tr) {
                $catName = $tr['name'];
                $amount = floatval($tr['amount']);

                // Inserimento nella tabella spese
                $stmt = $pdo->prepare("INSERT INTO transactions (type, category, amount, date, name, time,wallet_id) VALUES (?, ?, ?, ?, ?, ?,?) ");
                $stmt->execute(["outcome", $catName, $amount, $nowDate, "Cash", $nowTime , 1]);

                // Aggiorna spent nella tabella categories
                $stmt = $pdo->prepare("UPDATE categories SET spent = spent + ? WHERE name = ?");
                $stmt->execute([$amount, $catName]);

                // Controllo superamento limite e recupero path
                $stmt = $pdo->prepare("SELECT limite, spent, path FROM categories WHERE name = ?");
                $stmt->execute([$catName]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($row && $row['spent'] > $row['limite']) {
                    $exceededCategories[] = [
                        "name" => $catName,
                        "path" => $row['path'] // aggiunge il path dell'immagine
                    ];
                }
            }
        }

        $pdo->commit();

        header('Content-Type: application/json');
        echo json_encode([
            "success" => true,
            "exceededCategories" => $exceededCategories
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false,
            "error" => $e->getMessage()
        ]);
    }

    exit;
}

if ($path === "api/goals") {
    // se vuoi usare la sessione, sostituisci con $_SESSION['user_id'] ?? null
    $userId = $_GET["user_id"] ?? null;

    if (!$userId) {
        http_response_code(400);
        echo json_encode(["error" => "Parametro user_id mancante"]);
        exit;
    }

    $sql = "SELECT id, title, deadline, saved_amount, saving_amount, created_at
            FROM goals
            WHERE user_id = :user_id
            ORDER BY created_at DESC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':user_id' => $userId]);
        $goals = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        echo json_encode($goals);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Errore query: " . $e->getMessage()]);
    }
    exit;
}

if ($path === "api/accounts") {
    $user = $_GET["user"] ?? "";
    if (strlen($user) == 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "User not found"]);
        exit;
    }

    try {
        $sql = "SELECT name FROM wallets WHERE user_id = :user";
        $stmt = $pdo->prepare($sql);

        // Cast to integer to match Postgres integer type
        $stmt->execute(['user' => (int)$user]);

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Errore query: " . $e->getMessage()]);
    }
    exit;
}

if ($path === "api/insights") {
    $periodo = $_GET["periodo"] ?? "anno";
    $account = $_GET["account"] ?? "all";
    $type = $_GET["type"] ?? "outcome";


    switch ($periodo) {
        case "mese":
            if ($account=="all"){
                $sql = "
                        SELECT EXTRACT(MONTH FROM date) as month, SUM(amount) AS total_outcome
                        FROM transactions 
                        WHERE type= :type
                        group by EXTRACT(MONTH FROM date)";
                    
            }
            else{
                $sql = "
                        SELECT EXTRACT(MONTH FROM date) as month, SUM(amount) AS total_outcome
                        FROM transactions 
                        WHERE type=:type and wallet_name=:account
                        group by EXTRACT(MONTH FROM date)";
            }
                    
            break;
            
        case "settimana":
            if ($account=="all"){
                $sql = "
                        SELECT EXTRACT(WEEK FROM date) as month, SUM(amount) AS total_outcome
                        FROM transactions 
                        WHERE type=:type
                        group by EXTRACT(WEEK FROM date)";
                    
            }
            else{
                $sql = "
                        SELECT EXTRACT(WEEK FROM date) as month, SUM(amount) AS total_outcome
                        FROM transactions 
                        WHERE type= :type and wallet_name=:account
                        group by EXTRACT(WEEK FROM date)";
            }
                    
            break;
            
        default: // anno
            if ($account=="all"){
                $sql = "
                        SELECT EXTRACT(YEAR FROM date) as month, SUM(amount) AS total_outcome
                        FROM transactions 
                        WHERE type= :type
                        group by EXTRACT(YEAR FROM date)";
                    
            }
            else{
                $sql = "
                        SELECT EXTRACT(YEAR FROM date) as month, SUM(amount) AS total_outcome
                        FROM transactions 
                        WHERE type=:type and wallet_name= :account
                        group by EXTRACT(YEAR FROM date)";
            }
                    
            
    }

    try {
        $stmt = $pdo->prepare($sql);

        // Cast to integer to match Postgres integer type
        $stmt->execute(['type' => $type, 'account' => $account]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Errore query: " . $e->getMessage()]);
    }
    exit;
}


if ($path === "sharedAccounts") {
    $user = $_GET["user"] ?? "";
    try {
        $sql = "
            SELECT 
                id,
                name,
                balance,
                path,
                color,
                partecipant_num,
                partecipant_name_surname1,
                partecipant_name_surname2,
                partecipant_name_surname3,
                user_role,
                participant_role1,
                participant_role2,
                participant_role3,
                participant_permissions1,
                participant_permissions2,
                participant_permissions3,
                TO_CHAR(last_sync, 'YYYY-MM-DD') AS last_sync
            FROM shared_wallets 
            WHERE user_id = :user
            ORDER BY name ASC
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute(['user' => (int)$user]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows ?: []);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}


if ($path === "save_sw_changes") {
    header('Content-Type: application/json; charset=utf-8');

    $payload = json_decode(file_get_contents('php://input'), true) ?? [];
    $walletId = (int)($payload['wallet_id'] ?? 0);
    $participants = $payload['participants'] ?? []; // [{name, role}], ordine finale slot 1..3

    if ($walletId <= 0 || !is_array($participants)) {
        http_response_code(400);
        echo json_encode(["error" => "Parametri non validi"]);
        exit;
    }

    // normalizza array a 3 slot
    $participants = array_values($participants);
    $participants = array_slice($participants, 0, 3);
    for ($i=0; $i<3; $i++) {
        $participants[$i] = $participants[$i] ?? ["name" => null, "role" => null];
        $participants[$i]["name"] = isset($participants[$i]["name"]) && trim($participants[$i]["name"]) !== "" ? trim($participants[$i]["name"]) : null;
        $participants[$i]["role"] = isset($participants[$i]["role"]) && trim($participants[$i]["role"]) !== "" ? trim($participants[$i]["role"]) : null;
    }

    // conta i non-null
    $num = 0;
    foreach ($participants as $p) { if (!is_null($p["name"])) $num++; }

    try {
        // Leggi la riga attuale per preservare i permessi ed evitare NULL
        $pdo->beginTransaction();

        $sel = $pdo->prepare("
            SELECT
              partecipant_name_surname1, partecipant_name_surname2, partecipant_name_surname3,
              participant_role1, participant_role2, participant_role3,
              participant_permissions1, participant_permissions2, participant_permissions3
            FROM shared_wallets
            WHERE id = :id
            FOR UPDATE
        ");
        $sel->execute(["id" => $walletId]);
        $row = $sel->fetch(PDO::FETCH_ASSOC);
        if (!$row) throw new PDOException("Wallet non trovato");

        $oldNames = [
            $row["partecipant_name_surname1"],
            $row["partecipant_name_surname2"],
            $row["partecipant_name_surname3"],
        ];
        $oldPerms = [
            $row["participant_permissions1"] ?? '',
            $row["participant_permissions2"] ?? '',
            $row["participant_permissions3"] ?? '',
        ];

        // calcola i permessi nuovi per slot 1..3:
        // se il nome esisteva prima, riusa i suoi permessi; altrimenti stringa vuota '' (NOT NULL safe)
        $newPerms = ['', '', ''];
        for ($i=0; $i<3; $i++) {
            $name = $participants[$i]["name"];
            if ($name !== null) {
                $matchIndex = null;
                for ($j=0; $j<3; $j++) {
                    if ($oldNames[$j] !== null && trim($oldNames[$j]) === $name) {
                        $matchIndex = $j; break;
                    }
                }
                $newPerms[$i] = $matchIndex !== null ? ($oldPerms[$matchIndex] ?? '') : '';
            } else {
                $newPerms[$i] = ''; // colonne NOT NULL
            }
        }

        $sql = "
            UPDATE shared_wallets
            SET
                partecipant_num = :num,
                partecipant_name_surname1 = :n1,
                partecipant_name_surname2 = :n2,
                partecipant_name_surname3 = :n3,
                participant_role1 = :r1,
                participant_role2 = :r2,
                participant_role3 = :r3,
                participant_permissions1 = :p1,
                participant_permissions2 = :p2,
                participant_permissions3 = :p3
            WHERE id = :id
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            "num" => $num,
            "n1" => $participants[0]["name"], "n2" => $participants[1]["name"], "n3" => $participants[2]["name"],
            "r1" => $participants[0]["role"], "r2" => $participants[1]["role"], "r3" => $participants[2]["role"],
            "p1" => $newPerms[0], "p2" => $newPerms[1], "p3" => $newPerms[2],
            "id" => $walletId
        ]);

        $pdo->commit();
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

if ($path === "friends") {
    header('Content-Type: application/json; charset=utf-8');

    $user = (int)($_GET["user"] ?? 0);
    if ($user <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "Missing/invalid user"]);
        exit;
    }

    try {
        // Verifica che la tabella esista (evita 500 inspiegabili)
        $chk = $pdo->query("
            SELECT to_regclass('public.friendship') AS exists_rel
        ")->fetch(PDO::FETCH_ASSOC);
        if (!$chk || !$chk['exists_rel']) {
            http_response_code(500);
            echo json_encode(["error" => "Table 'friendship' does not exist"]);
            exit;
        }

        $sql = "
            SELECT 
                id,
                friend_id,
                friend_name
            FROM friendship
            WHERE user_id = :user
            ORDER BY friend_name ASC
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['user' => $user]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows ?: []);
    } catch (PDOException $e) {
        // Log server-side se hai un file di log
        error_log('[friends API] ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

if ($path === "invitations") {
    header('Content-Type: application/json; charset=utf-8');
    $user = (int)($_GET["user"] ?? 0);
    if ($user <= 0) { http_response_code(400); echo json_encode(["error"=>"Missing/invalid user"]); exit; }

    try {
        $sql = "
          SELECT id,
                 sender_first_name, sender_last_name,
                 sent_day, sent_month, sent_year,
                 wallet_id,                -- IMPORTANTE
                 wallet_name, wallet_balance, participants_count
          FROM invitations
          WHERE receiver_id = :user
          ORDER BY sent_year DESC, sent_month DESC, sent_day DESC, id DESC
        ";
        $st = $pdo->prepare($sql);
        $st->execute(['user'=>$user]);
        echo json_encode($st->fetchAll(PDO::FETCH_ASSOC) ?: []);
    } catch (Throwable $e) {
        error_log('[invitations GET] '.$e->getMessage());
        http_response_code(500); echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}


if ($path === 'invitation_accept' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json; charset=utf-8');

    $p          = json_decode(file_get_contents('php://input'), true) ?: [];
    $invId      = (int)($p['invitation_id'] ?? 0);
    $receiverId = (int)($p['receiver_id'] ?? 0);
    $postedWId  = (int)($p['wallet_id'] ?? 0);

    if ($invId <= 0 || $receiverId <= 0) {
        http_response_code(400);
        echo json_encode(['error'=>'Missing invitation_id or receiver_id']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // 1) Lettura invito (LOCK)
        $st = $pdo->prepare("SELECT * FROM invitations WHERE id=:id FOR UPDATE");
        $st->execute(['id'=>$invId]);
        $inv = $st->fetch(PDO::FETCH_ASSOC);
        if (!$inv) throw new Exception('Invitation not found');
        if ((int)$inv['receiver_id'] !== $receiverId) throw new Exception('Invitation not for this user');

        // Nome completo receiver (fallback “Mario Rossi”)
        $receiverFullName = trim(trim((string)($inv['receiver_first_name'] ?? '')) . ' ' . trim((string)($inv['receiver_last_name'] ?? '')));
        if ($receiverFullName === '') $receiverFullName = 'Mario Rossi';

        // 2) TROVA WALLET SORGENTE (robusto + debug)
        $debug = [
            'posted_wallet_id' => $postedWId,
            'inv.wallet_id'    => $inv['wallet_id'] ?? null,
            'inv.sender_id'    => $inv['sender_id'] ?? null,
            'inv.wallet_name'  => $inv['wallet_name'] ?? null
        ];

        $w = null;

        // 2a) per ID passato dal FE
        if ($postedWId > 0) {
            $q = $pdo->prepare("SELECT * FROM shared_wallets WHERE id=:id FOR UPDATE");
            $q->execute(['id'=>$postedWId]);
            $w = $q->fetch(PDO::FETCH_ASSOC);
            if (!$w) $debug['miss_postedWId'] = 'not found';
        }

        // 2b) per ID presente sull’invito
        if (!$w && !empty($inv['wallet_id'])) {
            $q = $pdo->prepare("SELECT * FROM shared_wallets WHERE id=:id FOR UPDATE");
            $q->execute(['id'=>(int)$inv['wallet_id']]);
            $w = $q->fetch(PDO::FETCH_ASSOC);
            if (!$w) $debug['miss_inv.wallet_id'] = 'not found';
        }

        // 2c) per owner+nome (case/space-insensitive)
        if (!$w && !empty($inv['sender_id']) && !empty($inv['wallet_name'])) {
            $q = $pdo->prepare("
                SELECT * FROM shared_wallets
                WHERE user_id = :owner
                  AND lower(btrim(name)) = lower(btrim(:name))
                ORDER BY id DESC
                LIMIT 1
                FOR UPDATE
            ");
            $q->execute(['owner'=>(int)$inv['sender_id'], 'name'=>(string)$inv['wallet_name']]);
            $w = $q->fetch(PDO::FETCH_ASSOC);
            if (!$w) $debug['miss_owner_name'] = 'not found';
        }

        // 2d) ultimo fallback: per solo nome (se unico o prendiamo l’ultimo)
        if (!$w && !empty($inv['wallet_name'])) {
            $q = $pdo->prepare("
                SELECT * FROM shared_wallets
                WHERE lower(btrim(name)) = lower(btrim(:name))
                ORDER BY id DESC
                LIMIT 1
                FOR UPDATE
            ");
            $q->execute(['name'=>(string)$inv['wallet_name']]);
            $w = $q->fetch(PDO::FETCH_ASSOC);
            if (!$w) $debug['miss_name_only'] = 'not found';
        }

        if (!$w) {
            throw new Exception('Source wallet not found | debug=' . json_encode($debug));
        }

        // 3) Aggiungi il receiver tra i partecipanti (max 3 slot) se non già presente
        $p1 = trim((string)($w['partecipant_name_surname1'] ?? ''));
        $p2 = trim((string)($w['partecipant_name_surname2'] ?? ''));
        $p3 = trim((string)($w['partecipant_name_surname3'] ?? ''));

        $alreadyThere = false;
        foreach ([$p1,$p2,$p3] as $pname) {
            if ($pname !== '' && mb_strtolower($pname) === mb_strtolower($receiverFullName)) { $alreadyThere = true; break; }
        }

        if (!$alreadyThere) {
            $slotField=null; $roleField=null; $permField=null;
            if ($p1==='')      { $slotField='partecipant_name_surname1'; $roleField='participant_role1'; $permField='participant_permissions1'; }
            elseif ($p2==='')  { $slotField='partecipant_name_surname2'; $roleField='participant_role2'; $permField='participant_permissions2'; }
            elseif ($p3==='')  { $slotField='partecipant_name_surname3'; $roleField='participant_role3'; $permField='participant_permissions3'; }
            else               { throw new Exception('No free participant slot in this wallet'); }

            $upd = $pdo->prepare("
                UPDATE shared_wallets
                SET $slotField = :name,
                    $roleField = COALESCE($roleField, 'Viewer'),
                    $permField = COALESCE($permField, 'view'),
                    partecipant_num = LEAST(COALESCE(partecipant_num,0)+1, 3),
                    last_sync = NOW()::date
                WHERE id = :id
            ");
            $upd->execute(['name'=>$receiverFullName, 'id'=>(int)$w['id']]);
        }

        // 4) Crea/garantisce la copia per il receiver
        $exists = $pdo->prepare("SELECT id FROM shared_wallets WHERE user_id=:u AND name=:n LIMIT 1");
        $exists->execute(['u'=>$receiverId, 'n'=>(string)$w['name']]);
        $existingId = $exists->fetchColumn();

        if ($existingId) {
            $copiedId = (int)$existingId;
        } else {
            $copy = $pdo->prepare("
                INSERT INTO shared_wallets (
                    user_id, name, spent, income, balance, path, color,
                    partecipant_num,
                    partecipant_name_surname1, partecipant_name_surname2, partecipant_name_surname3,
                    user_role,
                    participant_role1, participant_role2, participant_role3,
                    participant_permissions1, participant_permissions2, participant_permissions3,
                    last_sync, created_at
                )
                SELECT
                    :uid, name, spent, income, balance, path, color,
                    partecipant_num,
                    partecipant_name_surname1, partecipant_name_surname2, partecipant_name_surname3,
                    'Viewer',
                    participant_role1, participant_role2, participant_role3,
                    participant_permissions1, participant_permissions2, participant_permissions3,
                    NOW()::date, NOW()
                FROM shared_wallets
                WHERE id = :src
                RETURNING id
            ");
            $copy->execute(['uid'=>$receiverId, 'src'=>(int)$w['id']]);
            $copiedId = (int)$copy->fetchColumn();
        }

        // 5) Rimuovi invito (o status='accepted')
        $pdo->prepare("DELETE FROM invitations WHERE id=:id")->execute(['id'=>$invId]);

        // 6) Ritorna la riga wallet formattata per il FE
        $sel = $pdo->prepare("
            SELECT 
                id, name, balance, path, color,
                partecipant_num,
                partecipant_name_surname1, partecipant_name_surname2, partecipant_name_surname3,
                user_role,
                participant_role1, participant_role2, participant_role3,
                participant_permissions1, participant_permissions2, participant_permissions3,
                TO_CHAR(last_sync,'YYYY-MM-DD') AS last_sync
            FROM shared_wallets
            WHERE id = :id
        ");
        $sel->execute(['id'=>$copiedId]);
        $wallet = $sel->fetch(PDO::FETCH_ASSOC);

        $pdo->commit();
        echo json_encode(['ok'=>true, 'wallet'=>$wallet]);

    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(400);
        echo json_encode(['error'=>$e->getMessage()]);
    }
    exit;
}

if ($path === "api/stats") {
    $period = $_GET["period"] ?? "year";

    switch ($period) {
        case "month":
            $groupBy = "EXTRACT(DAY FROM date)";
            break;
        case "week":
            $groupBy = "EXTRACT(DOW FROM date)";
            break;
        default: // year
            $groupBy = "EXTRACT(MONTH FROM date)";
    }

    $sql = "
        SELECT $groupBy as period,
               SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
               SUM(CASE WHEN type='outcome' THEN amount ELSE 0 END) as outcome
        FROM transactions
        WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
        GROUP BY period
        ORDER BY period
    ";

    try {
        $stmt = $pdo->query($sql);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Query error: " . $e->getMessage()]);
    }
    exit;
}


// Se non trova corrispondenza
http_response_code(404);
echo json_encode(["error" => "Endpoint non trovato"]);
