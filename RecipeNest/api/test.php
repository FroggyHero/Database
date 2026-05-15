<?php
require "headers.php";
require "db.php";

// Get the raw input
$input = file_get_contents("php://input");
$data = json_decode($input, true);

echo json_encode([
    "received_data" => $data,
    "request_method" => $_SERVER["REQUEST_METHOD"],
    "email" => $data["email"] ?? "NOT PROVIDED",
    "password" => $data["password"] ?? "NOT PROVIDED"
]);
?>
