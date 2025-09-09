<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

session_start();

$host = "localhost"; //alessio 192.168.1.12
$dbname = "financeTrack"; // alessio financeTrack
$user = "postgres";
$pass = "admin";
$port = "5432";  // alessio =3000


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
    $pathImg = $data["path"] ?? null;
    $limite  = $data["limite"] ?? null;
    $spent   = $data["spent"] ?? 0;

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

/* -------------------------------
   API: GET /income_sum
-------------------------------- */
if ($path === "income_sum") {
    try {
        $stmt = $pdo->query("SELECT COALESCE(SUM(amount),0) AS totale FROM transactions WHERE type='income'");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($result ?: ["totale" => 0]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Errore query: " . $e->getMessage()]);
    }
    exit;
}

/* -------------------------------
   API: GET /spent_sum
-------------------------------- */
if ($path === "spent_sum") {
    try {
        $stmt = $pdo->query("SELECT COALESCE(SUM(amount),0) AS totale FROM transactions WHERE type='outcome'");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($result ?: ["totale" => 0]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Errore query: " . $e->getMessage()]);
    }
    exit;
}

/* -------------------------------
   API: GET /today_transactions
-------------------------------- */
if ($path === "today_transactions") {
    try {
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
        $stmt = $pdo->query($sql);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows ?: []); 
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

/* -------------------------------
   API: GET /last_week_transactions
-------------------------------- */
if ($path === "last_week_transactions") {
    try {
        $sql = "
        SELECT s.id, 'spesa' AS tipo, s.amount, s.date, s.name AS nome, c.path AS path
        FROM transactions s
        JOIN categories c ON s.category = c.name
        WHERE s.date::date BETWEEN (CURRENT_DATE - INTERVAL '7 days') AND (CURRENT_DATE - INTERVAL '1 day') 
        ORDER BY date ASC
        ";
        $stmt = $pdo->query($sql);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows ?: []); 
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]); 
    }
    exit;
}

/* -------------------------------
   API: GET /accounts
-------------------------------- */
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

/* -------------------------------
   API: POST /add_account
-------------------------------- */
if ($path === "add_account") {
    header('Content-Type: application/json');
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || !isset($data["name"]) || !isset($data["type"]) || !isset($data["path"])) {
            throw new Exception("Campi obbligatori mancanti");
        }

        $last_sync = date("Y-m-d H:i:s");
        $balance = isset($data["balance"]) ? $data["balance"] : 0;

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

        $id = $stmt->fetchColumn();
        echo json_encode(["success" => true, "id" => $id, "last_sync" => $last_sync]);

    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit;
}

/* -------------------------------
   API: POST /update_account
-------------------------------- */
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
   API: POST /save_transaction
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
            $stmt = $pdo->prepare("INSERT INTO transactions (category, amount, date, name, time) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute(["Uncategorized", $total, $nowDate, "Cash", $nowTime]);
        } else {
            foreach ($transactions as $tr) {
                $catName = $tr['name'];
                $amount = floatval($tr['amount']);

                $stmt = $pdo->prepare("INSERT INTO transactions (category, amount, date, name, time) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$catName, $amount, $nowDate, "Cash", $nowTime]);

                $stmt = $pdo->prepare("UPDATE categories SET spent = spent + ? WHERE name = ?");
                $stmt->execute([$amount, $catName]);

                $stmt = $pdo->prepare("SELECT limite, spent, path FROM categories WHERE name = ?");
                $stmt->execute([$catName]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($row && $row['spent'] > $row['limite']) {
                    $exceededCategories[] = [
                        "name" => $catName,
                        "path" => $row['path']
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


/* ===============================
   GOALS API
   =============================== */

// GET /api.php?path=goals&user_id=1
if ($path === "goals") {
    $user_id = isset($_GET["user_id"]) ? intval($_GET["user_id"]) : 1;
    try {
        $sql = "SELECT id, user_id, name,
                       COALESCE(target_amount,0) AS target_amount,
                       COALESCE(saved_amount,0)  AS saved_amount,
                       TO_CHAR(deadline,'YYYY-MM-DD') AS deadline,
                       COALESCE(saving_source,'') AS saving_source,
                       COALESCE(goal_type,'')     AS goal_type
                FROM goals
                WHERE user_id = :uid
                ORDER BY deadline NULLS LAST, id DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([":uid"=>$user_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

// GET /api.php?path=goals_score&user_id=1
if ($path === "goals_score") {
    $user_id = isset($_GET["user_id"]) ? intval($_GET["user_id"]) : 1;
    try {
        $sql_reached = "SELECT COUNT(*) FROM goals
                        WHERE user_id = :uid
                          AND COALESCE(saved_amount,0) >= COALESCE(target_amount,0)";
        $sql_missed  = "SELECT COUNT(*) FROM goals
                        WHERE user_id = :uid
                          AND deadline IS NOT NULL
                          AND deadline < CURRENT_DATE
                          AND COALESCE(saved_amount,0) < COALESCE(target_amount,0)";
        $st1 = $pdo->prepare($sql_reached); $st1->execute([":uid"=>$user_id]);
        $st2 = $pdo->prepare($sql_missed);  $st2->execute([":uid"=>$user_id]);
        echo json_encode([
            "reached" => intval($st1->fetchColumn()),
            "missed"  => intval($st2->fetchColumn())
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

// GET /api.php?path=goal&id=...
if ($path === "goal") {
    $id = isset($_GET["id"]) ? intval($_GET["id"]) : 0;
    try {
        $stmt = $pdo->prepare("SELECT id, user_id, name,
                                      COALESCE(target_amount,0) AS target_amount,
                                      COALESCE(saved_amount,0)  AS saved_amount,
                                      TO_CHAR(deadline,'YYYY-MM-DD') AS deadline,
                                      COALESCE(saving_source,'') AS saving_source,
                                      COALESCE(goal_type,'')     AS goal_type
                               FROM goals WHERE id = :id");
        $stmt->execute([":id"=>$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) echo json_encode($row);
        else { http_response_code(404); echo json_encode(["error"=>"Goal not found"]); }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

// Helper JSON body (riusa la tua getJsonInput)
function json_body() {
    $j = getJsonInput();
    return is_array($j) ? $j : [];
}

// POST /api.php?path=create_goal
if ($path === "create_goal" && $_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_body();
    $user_id = intval($data["user_id"] ?? 1);
    $name = trim($data["name"] ?? "");
    $goal_type = $data["goal_type"] ?? null;
    $target_amount = isset($data["target_amount"]) ? floatval($data["target_amount"]) : null;
    $deadline = $data["deadline"] ?? null;
    $saving_source = $data["saving_source"] ?? null;

    if ($name === "") { http_response_code(400); echo json_encode(["error"=>"Missing name"]); exit; }
    try {
        $stmt = $pdo->prepare("INSERT INTO goals (user_id, name, goal_type, target_amount, deadline, saving_source, saved_amount)
                               VALUES (:uid, :name, :goal_type, :target_amount, :deadline, :saving_source, 0)
                               RETURNING id");
        $stmt->execute([
            ":uid"=>$user_id, ":name"=>$name, ":goal_type"=>$goal_type,
            ":target_amount"=>$target_amount, ":deadline"=>$deadline, ":saving_source"=>$saving_source
        ]);
        echo json_encode(["success"=>true, "id"=>intval($stmt->fetchColumn())]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

// POST /api.php?path=update_goal
if ($path === "update_goal" && $_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_body();
    $id = intval($data["id"] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(["error"=>"Missing id"]); exit; }

    $fields = []; $params = [":id"=>$id];
    foreach (["name","goal_type","saving_source"] as $k) {
        if (isset($data[$k])) { $fields[] = "$k = :$k"; $params[":$k"] = $data[$k]; }
    }
    if (isset($data["target_amount"])) { $fields[] = "target_amount = :target_amount"; $params[":target_amount"] = floatval($data["target_amount"]); }
    if (isset($data["deadline"]))       { $fields[] = "deadline = :deadline";         $params[":deadline"] = $data["deadline"]; }

    if (empty($fields)) { echo json_encode(["success"=>true]); exit; }

    try {
        $sql = "UPDATE goals SET ".implode(", ", $fields)." WHERE id = :id";
        $st = $pdo->prepare($sql);
        $st->execute($params);
        echo json_encode(["success"=>true]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

// POST /api.php?path=add_goal_funds
if ($path === "add_goal_funds" && $_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_body();
    $goal_id = intval($data["goal_id"] ?? 0);
    $amount  = floatval($data["amount"] ?? 0);
    $source  = $data["source"] ?? null;
    $date    = $data["date"] ?? date('Y-m-d');

    if (!$goal_id || $amount <= 0) {
        http_response_code(400);
        echo json_encode(["error"=>"Missing goal_id or invalid amount"]);
        exit;
    }
    try {
        $st = $pdo->prepare("INSERT INTO goal_contributions (goal_id, amount, source_wallet, date)
                             VALUES (:gid, :amount, :src, :dt)");
        $st->execute([":gid"=>$goal_id, ":amount"=>$amount, ":src"=>$source, ":dt"=>$date]);
        $pdo->prepare("UPDATE goals SET saved_amount = COALESCE(saved_amount,0) + :a WHERE id = :gid")
            ->execute([":a"=>$amount, ":gid"=>$goal_id]);
        echo json_encode(["success"=>true]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

// GET /api.php?path=goal_history&goal_id=...
if ($path === "goal_history") {
    $goal_id = isset($_GET["goal_id"]) ? intval($_GET["goal_id"]) : 0;
    try {
        $st = $pdo->prepare("SELECT id, amount, source_wallet,
                                    TO_CHAR(date,'YYYY-MM-DD') AS date
                             FROM goal_contributions
                             WHERE goal_id = :gid
                             ORDER BY date DESC, id DESC");
        $st->execute([":gid"=>$goal_id]);
        echo json_encode($st->fetchAll(PDO::FETCH_ASSOC) ?: []);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

// POST /api.php?path=delete_goal
if ($path === "delete_goal" && $_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = isset($data["id"]) ? intval($data["id"]) : 0;
    if (!$id) { http_response_code(400); echo json_encode(["error"=>"Missing id"]); exit; }

    try {
        $st = $pdo->prepare("DELETE FROM goals WHERE id = :id");
        $st->execute([":id" => $id]);
        echo json_encode(["success" => $st->rowCount() > 0]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}


// POST /api.php?path=signup
if ($path === "signup" && $_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true) ?? [];

    $name    = trim($data["name"]    ?? "");
    $surname = trim($data["surname"] ?? "");
    $telRaw  = trim($data["tel"]     ?? "");
    $birth   = trim($data["birth"]   ?? "");
    $email   = strtolower(trim($data["email"] ?? ""));
    $pass    = $data["password"]     ?? "";

    if ($name === "" || $surname === "" || $birth === "" || $email === "" || $pass === "") {
        http_response_code(400);
        echo json_encode(["error"=>"Missing required fields"]);
        exit;
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["error"=>"Invalid email"]);
        exit;
    }

    // tel opzionale: tieni solo cifre, poi cast a int o NULL
    $tel = preg_replace('/\D+/', '', $telRaw);
    if ($tel === "") $tel = null;

    try {
        // email già usata?
        $st = $pdo->prepare("SELECT 1 FROM users WHERE email = :e LIMIT 1");
        $st->execute([":e"=>$email]);
        if ($st->fetchColumn()) {
            http_response_code(409);
            echo json_encode(["error"=>"Email already registered"]);
            exit;
        }

        $hash = password_hash($pass, PASSWORD_DEFAULT);
        $sql = "INSERT INTO users(name, surname, tel, birth, email, password)
                VALUES(:name, :surname, :tel, :birth, :email, :pass)
                RETURNING id, name, surname, email";
        $ins = $pdo->prepare($sql);
        $ins->execute([
            ":name"=>$name, ":surname"=>$surname,
            ":tel"=>$tel, ":birth"=>$birth,
            ":email"=>$email, ":pass"=>$hash
        ]);
        $user = $ins->fetch(PDO::FETCH_ASSOC);

        // start session
        $_SESSION["user_id"] = (int)$user["id"];
        $_SESSION["user_email"] = $user["email"];
        $_SESSION["user_name"] = $user["name"];

        echo json_encode(["success"=>true, "user"=>$user]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

// POST /api.php?path=login
if ($path === "login" && $_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true) ?? [];
    $email = strtolower(trim($data["email"] ?? ""));
    $pass  = $data["password"] ?? "";

    if ($email === "" || $pass === "") {
        http_response_code(400);
        echo json_encode(["error"=>"Missing email or password"]);
        exit;
    }

    try {
        $st = $pdo->prepare("SELECT id, name, surname, email, password FROM users WHERE email = :e LIMIT 1");
        $st->execute([":e"=>$email]);
        $u = $st->fetch(PDO::FETCH_ASSOC);
        if (!$u || !password_verify($pass, $u["password"])) {
            http_response_code(401);
            echo json_encode(["error"=>"Invalid credentials"]);
            exit;
        }

        // set session
        $_SESSION["user_id"] = (int)$u["id"];
        $_SESSION["user_email"] = $u["email"];
        $_SESSION["user_name"] = $u["name"];

        unset($u["password"]);
        echo json_encode(["success"=>true, "user"=>$u]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

// GET /api.php?path=logout
if ($path === "logout") {
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"], $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
    echo json_encode(["success"=>true]);
    exit;
}

// GET /api.php?path=me
if ($path === "me") {
    if (!isset($_SESSION["user_id"])) {
        http_response_code(401);
        echo json_encode(["error"=>"Not authenticated"]);
        exit;
    }
    try {
        $st = $pdo->prepare("SELECT id, name, surname, email, birth, tel, photo, created_at FROM users WHERE id = :id");
        $st->execute([":id"=>$_SESSION["user_id"]]);
        $user = $st->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["user"=>$user]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

// helper: JSON o form-urlencoded
function readInput() {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);
    if (!is_array($data)) $data = $_POST; // allow form posts too
    return $data ?: [];
}

// POST /api.php?path=signup
if ($path === "signup" && $_SERVER["REQUEST_METHOD"] === "POST") {
    $data = readInput();

    $name    = trim($data["name"]    ?? "");
    $surname = trim($data["surname"] ?? "");
    $telRaw  = trim($data["tel"]     ?? "");
    $birth   = trim($data["birth"]   ?? "");
    $email   = strtolower(trim($data["email"] ?? ""));
    $pass    = $data["password"]     ?? "";

    if ($email === "" || $pass === "" || $birth === "") {
        http_response_code(400);
        echo json_encode(["error"=>"Missing required fields (email, password, birth)"]);
        exit;
    }
    if ($name === "")    $name = explode("@", $email)[0] ?? "User";
    if ($surname === "") $surname = "User";
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["error"=>"Invalid email"]);
        exit;
    }

    $telDigits = preg_replace('/\D+/', '', $telRaw);
    $tel = ($telDigits === "") ? null : (int)$telDigits;

    try {
        $st = $pdo->prepare("SELECT 1 FROM users WHERE email = :e LIMIT 1");
        $st->execute([":e"=>$email]);
        if ($st->fetchColumn()) {
            http_response_code(409);
            echo json_encode(["error"=>"Email already registered"]);
            exit;
        }

        $hash = password_hash($pass, PASSWORD_DEFAULT);
        $sql = "INSERT INTO users(name, surname, tel, birth, email, password)
                VALUES(:name, :surname, :tel, :birth, :email, :pass)
                RETURNING id, name, surname, email";
        $ins = $pdo->prepare($sql);
        $ins->execute([
            ":name"=>$name, ":surname"=>$surname, ":tel"=>$tel, ":birth"=>$birth,
            ":email"=>$email, ":pass"=>$hash
        ]);
        $user = $ins->fetch(PDO::FETCH_ASSOC);
        $_SESSION["user_id"] = (int)$user["id"];
        $_SESSION["user_email"] = $user["email"];
        $_SESSION["user_name"] = $user["name"];
        echo json_encode(["success"=>true, "user"=>$user]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

// POST /api.php?path=login
if ($path === "login" && $_SERVER["REQUEST_METHOD"] === "POST") {
    $data = readInput();
    $email = strtolower(trim($data["email"] ?? ""));
    $pass  = $data["password"] ?? "";

    if ($email === "" || $pass === "") {
        http_response_code(400);
        echo json_encode(["error"=>"Missing email or password"]);
        exit;
    }

    try {
        $st = $pdo->prepare("SELECT id, name, surname, email, password FROM users WHERE email = :e LIMIT 1");
        $st->execute([":e"=>$email]);
        $u = $st->fetch(PDO::FETCH_ASSOC);
        if (!$u || !password_verify($pass, $u["password"])) {
            http_response_code(401);
            echo json_encode(["error"=>"Invalid credentials"]);
            exit;
        }
        $_SESSION["user_id"] = (int)$u["id"];
        $_SESSION["user_email"] = $u["email"];
        $_SESSION["user_name"] = $u["name"];
        unset($u["password"]);
        echo json_encode(["success"=>true, "user"=>$u]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}
// POST /api.php?path=upload_photo  (multipart/form-data with "photo")
if ($path === "upload_photo" && $_SERVER["REQUEST_METHOD"] === "POST") {
    header("Content-Type: application/json");
    if (!isset($_SESSION["user_id"])) {
        http_response_code(401);
        echo json_encode(["error" => "Not authenticated"]);
        exit;
    }

    if (!isset($_FILES["photo"])) {
        http_response_code(400);
        echo json_encode(["error" => "No file field 'photo'"]);
        exit;
    }
    if ($_FILES["photo"]["error"] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["error" => "Upload error code: " . $_FILES["photo"]["error"]]);
        exit;
    }

    $tmp  = $_FILES["photo"]["tmp_name"];
    $orig = $_FILES["photo"]["name"] ?? "photo";
    $size = $_FILES["photo"]["size"] ?? 0;

    // 5MB limit (tweak if you like)
    if ($size > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(["error" => "File too large (max 5MB)"]);
        exit;
    }

    // Determine extension safely
    $allowedMimeToExt = [
        "image/jpeg" => "jpg",
        "image/png"  => "png",
        "image/webp" => "webp",
    ];
    $ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
    $mime = null;

    if (function_exists('finfo_open')) {
        $fi = finfo_open(FILEINFO_MIME_TYPE);
        if ($fi) { $mime = finfo_file($fi, $tmp); finfo_close($fi); }
    } elseif (function_exists('mime_content_type')) {
        $mime = @mime_content_type($tmp);
    } else {
        // fallback to client-provided type (not ideal, but okay for dev)
        $mime = $_FILES["photo"]["type"] ?? null;
    }

    if ($mime && isset($allowedMimeToExt[$mime])) {
        $ext = $allowedMimeToExt[$mime];
    }

    if (!in_array($ext, ["jpg", "jpeg", "png", "webp"], true)) {
        http_response_code(400);
        echo json_encode(["error" => "Unsupported file type", "details" => ["mime" => $mime, "ext" => $ext]]);
        exit;
    }
    if ($ext === "jpeg") $ext = "jpg";

    // Make sure the directory exists
    $baseDir = __DIR__ . "/uploads/avatars";
    if (!is_dir($baseDir) && !@mkdir($baseDir, 0777, true)) {
        http_response_code(500);
        echo json_encode(["error" => "Cannot create uploads/avatars directory"]);
        exit;
    }

    // Generate a safe unique name
    try { $rand = bin2hex(random_bytes(4)); } catch (Throwable $e) { $rand = substr(bin2hex(uniqid("", true)), 0, 8); }
    $fname = "u" . $_SESSION["user_id"] . "_" . time() . "_" . $rand . "." . $ext;
    $dest  = $baseDir . "/" . $fname;

    if (!@move_uploaded_file($tmp, $dest)) {
        http_response_code(500);
        echo json_encode(["error" => "Unable to store file"]);
        exit;
    }
    @chmod($dest, 0644);

    // Return relative path (public)
    $public = "uploads/avatars/" . $fname;
    echo json_encode(["success" => true, "photo" => $public]);
    exit;
}


// POST /api.php?path=update_user  (JSON con name, surname, tel, birth, photo)
if ($path === "update_user" && $_SERVER["REQUEST_METHOD"] === "POST") {
    if (!isset($_SESSION["user_id"])) {
        http_response_code(401);
        echo json_encode(["error"=>"Not authenticated"]);
        exit;
    }
    $data = json_decode(file_get_contents("php://input"), true) ?? [];

    $name    = isset($data["name"])    ? trim($data["name"])    : null;
    $surname = isset($data["surname"]) ? trim($data["surname"]) : null;
    $birth   = isset($data["birth"])   ? trim($data["birth"])   : null;
    $telRaw  = isset($data["tel"])     ? trim($data["tel"])     : null;
    $photo   = isset($data["photo"])   ? trim($data["photo"])   : null; // es. uploads/avatars/xxx.jpg

    $fields = [];
    $params = [":id"=>$_SESSION["user_id"]];

    if ($name !== null && $name !== "")        { $fields[] = "name = :name";           $params[":name"]=$name; }
    if ($surname !== null && $surname !== "")  { $fields[] = "surname = :surname";     $params[":surname"]=$surname; }
    if ($birth !== null && $birth !== "")      { $fields[] = "birth = :birth";         $params[":birth"]=$birth; }
    if ($telRaw !== null) {
        $telDigits = preg_replace('/\D+/', '', $telRaw);
        if ($telDigits === "") { $fields[] = "tel = NULL"; }
        else { $fields[] = "tel = :tel"; $params[":tel"] = intval($telDigits); }
    }
    if ($photo !== null && $photo !== "")      { $fields[] = "photo = :photo";         $params[":photo"]=$photo; }

    if (empty($fields)) {
        echo json_encode(["success"=>true]); // niente da aggiornare
        exit;
    }

    try{
        $sql = "UPDATE users SET ".implode(", ", $fields)." WHERE id = :id";
        $st = $pdo->prepare($sql);
        $st->execute($params);
        echo json_encode(["success"=>true]);
    }catch(PDOException $e){
        http_response_code(500);
        echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

/* ===============================
   END GOALS API
   =============================== */

// Se non trova corrispondenza
http_response_code(404);
echo json_encode(["error" => "Endpoint non trovato"]);
