<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$host = "localhost";
$dbname = "FinanceTrack";
$user = "postgres";
$pass = "admin";
$port = "3000"; // attenzione: di solito PostgreSQL usa 5432, cambia se serve

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

// Se non trova corrispondenza
http_response_code(404);
echo json_encode(["error" => "Endpoint non trovato"]);
