<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$host = "localhost"; //alessio 192.168.1.12

$dbname = "financeTrack"; // alessio financeTrack
$user = "postgres";
$pass = "admin";
$port = "5433";  // alessio =3000

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
                GROUP BY category ";
            break;
        case "settimana":
            $sql = "
                SELECT category , SUM(amount) AS totale
                FROM transactions
                WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
                  AND EXTRACT(WEEK FROM date) = EXTRACT(WEEK FROM CURRENT_DATE)
                GROUP BY category ";
            break;
        default: // anno
            $sql = "
                SELECT category , SUM(amount) AS totale
                FROM transactions
                WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
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
        $sql = "
            SELECT type, 
                   s.amount, 
                   s.date, 
                   s.time AS orario,
                   s.name AS nome, 
                   c.path AS path
            FROM transactions s
            JOIN categories c ON LOWER(TRIM(s.category)) = LOWER(TRIM(c.name))
            WHERE s.date::date = CURRENT_DATE 
            ORDER BY time ASC
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
        $sql = "
        SELECT s.id, 'spesa' AS tipo, s.amount, s.date, s.name AS nome, c.path AS path
        FROM transactions s
        JOIN categories c ON s.category = c.name
        WHERE s.data::date BETWEEN (CURRENT_DATE - INTERVAL '7 days') AND (CURRENT_DATE - INTERVAL '1 day') 
        ORDER BY date ASC
        ";

   

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
            FROM wallets
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
            INSERT INTO wallets (name, type, path, balance, last_sync)
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

        $sql = "UPDATE wallets SET ".implode(", ", $fields).", last_sync=NOW() WHERE id=:id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode(["success"=>true]);
    } catch(Exception $e) {
        http_response_code(400);
        echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}
/* -------------------------------
   API: POST /save_transaction (debug avanzato)
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
            $stmt = $pdo->prepare("INSERT INTO transactions (category, amount, date, name, time) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute(["Uncategorized", $total, $nowDate, "Cash", $nowTime]);
        } else {
            foreach ($transactions as $tr) {
                $catName = $tr['name'];
                $amount = floatval($tr['amount']);

                // Inserimento nella tabella spese
                $stmt = $pdo->prepare("INSERT INTO transactions (category, amount, date, name, time) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$catName, $amount, $nowDate, "Cash", $nowTime]);

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



// Se non trova corrispondenza
http_response_code(404);
echo json_encode(["error" => "Endpoint non trovato"]);
