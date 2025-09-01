<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$host = "192.168.1.12";

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
                SELECT categoria, SUM(importo) AS totale
                FROM spese
                WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
                  AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)
                GROUP BY categoria";
            break;
        case "settimana":
            $sql = "
                SELECT categoria, SUM(importo) AS totale
                FROM spese
                WHERE EXTRACT(WEEK FROM data) = EXTRACT(WEEK FROM CURRENT_DATE)
                  AND EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
                GROUP BY categoria";
            break;
        default: // anno
            $sql = "
                SELECT categoria, SUM(importo) AS totale
                FROM spese
                WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
                GROUP BY categoria";
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
        $stmt = $pdo->query("SELECT category_name, path, limite, spent FROM categories ORDER BY id");
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

    $category_name = $data["category_name"] ?? null;
    $pathImg       = $data["path"] ?? null;
    $limite        = $data["limite"] ?? null;
    $spent         = $data["spent"] ?? 0;

    if (!$category_name || !$pathImg || $limite === null) {
        http_response_code(400);
        echo json_encode(["error" => "Dati mancanti"]);
        exit;
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO categories (category_name, path, limite, spent) 
                               VALUES (:name, :path, :limite, :spent) RETURNING *");
        $stmt->execute([
            ":name" => $category_name,
            ":path" => $pathImg,
            ":limite" => $limite,
            ":spent" => $spent
        ]);
        $newCategory = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($spent > 0) {
            $stmt2 = $pdo->prepare("INSERT INTO spese (categoria, importo, data) VALUES (:cat, :imp, NOW()) RETURNING *");
            $stmt2->execute([
                ":cat" => $category_name,
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
        $stmt = $pdo->query("SELECT SUM(importo) AS totale FROM income");
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
        $stmt = $pdo->query("SELECT SUM(importo) AS totale FROM spese");
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
        // Spese con join su categories per prendere path immagine
        $sqlSpese = "
            SELECT 'spesa' AS tipo, 
                   s.importo, 
                   s.data, 
                   s.orario AS orario,
                   s.nome AS nome, 
                   c.path AS path
            FROM spese s
            JOIN categories c ON LOWER(TRIM(s.categoria)) = LOWER(TRIM(c.category_name))
            WHERE s.data::date = CURRENT_DATE
        ";

        // Income con path fisso ./Cash.png
        $sqlIncome = "
            SELECT 'income' AS tipo, 
                   i.importo, 
                   i.data, 
                   i.orario AS orario,
                   i.nome AS nome, 
                   './Cash.png' AS path
            FROM income i
            WHERE i.data::date = CURRENT_DATE
        ";

        // Unione e ordinamento basato sul timestamp completo
        $stmt = $pdo->query("
            ($sqlSpese) 
            UNION ALL 
            ($sqlIncome) 
            ORDER BY orario ASC
        ");

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
        $sqlSpese = "
        SELECT s.id, 'spesa' AS tipo, s.importo, s.data, s.nome AS nome, c.path AS path
        FROM spese s
        JOIN categories c ON s.categoria = c.category_name
        WHERE s.data::date BETWEEN (CURRENT_DATE - INTERVAL '7 days') AND (CURRENT_DATE - INTERVAL '1 day')
        ";

    $sqlIncome = "
        SELECT i.id, 'income' AS tipo, i.importo, i.data, i.nome AS nome, './Cash.png' AS path
        FROM income i
        WHERE i.data::date BETWEEN (CURRENT_DATE - INTERVAL '7 days') AND (CURRENT_DATE - INTERVAL '1 day')
    ";

        // Unione e ordinamento per data
        $stmt = $pdo->query("($sqlSpese) UNION ALL ($sqlIncome) ORDER BY data ASC");
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
            $stmt = $pdo->prepare("INSERT INTO spese (categoria, importo, data, nome, orario) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute(["Uncategorized", $total, $nowDate, "Cash", $nowTime]);
        } else {
            foreach ($transactions as $tr) {
                $catName = $tr['category_name'];
                $amount = floatval($tr['amount']);

                // Inserimento nella tabella spese
                $stmt = $pdo->prepare("INSERT INTO spese (categoria, importo, data, nome, orario) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$catName, $amount, $nowDate, "Cash", $nowTime]);

                // Aggiorna spent nella tabella categories
                $stmt = $pdo->prepare("UPDATE categories SET spent = spent + ? WHERE category_name = ?");
                $stmt->execute([$amount, $catName]);

                // Controllo superamento limite e recupero path
                $stmt = $pdo->prepare("SELECT limite, spent, path FROM categories WHERE category_name = ?");
                $stmt->execute([$catName]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($row && $row['spent'] > $row['limite']) {
                    $exceededCategories[] = [
                        "category_name" => $catName,
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
