<?php
// ============================================================
// db.php — Database Connection
// ============================================================

$host = "localhost";
$user = "root";       // default XAMPP username
$pass = "";           // default XAMPP password (blank)
$db   = "RecipeNest";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode([
        "success" => false,
        "message" => "DB Error: " . $conn->connect_error
    ]));
}

$conn->set_charset("utf8");
?>
