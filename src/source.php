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
    API: GET /insights
-------------------------------- */
if ($path === "api/accounts") {
    $user = $_GET["user"] ?? "";
    if (strlen($user) == 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "User not found"]);
        exit;
    }

    try {
        $sql = "SELECT wallet_name AS name FROM wallets WHERE user_id = :user";
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




/* -------------------------------
    API: GET /insights
-------------------------------- */

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
                partecipant_name_surname2 ,
                partecipant_name_surname3,
                participant_role1,
                participant_role2,
                participant_role3,
                participant_permissions1,
                participant_permissions2,
                participant_permissions3,
                TO_CHAR(last_sync, 'YYYY-MM-DD') AS last_sync
            FROM shared_wallets 
            WHERE user_id= :user
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


