<?php
$host = "localhost";
$port = "5433";
$dbname = "financeTrack";
$user = "postgres";
$password = "admin";

try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname;", $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>
