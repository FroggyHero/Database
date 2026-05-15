<?php
// ============================================================
// register.php — POST /api/register
// Creates a new user account
// Expects: { name, email, password }
// Returns: { success, message? }
// ============================================================

require "headers.php";
require "db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (empty($data["name"]) || empty($data["email"]) || empty($data["password"])) {
    echo json_encode(["success" => false, "message" => "Name, email, and password are required."]);
    exit();
}

$name     = $conn->real_escape_string(trim($data["name"]));
$email    = $conn->real_escape_string(trim($data["email"]));
$password = password_hash($data["password"], PASSWORD_DEFAULT);

// Check if email is already registered
$check = $conn->query("SELECT id FROM users WHERE email = '$email'");
if ($check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "An account with that email already exists."]);
    exit();
}

// Insert new user
$conn->query("
    INSERT INTO users (name, email, password, created_at)
    VALUES ('$name', '$email', '$password', NOW())
");

if ($conn->affected_rows > 0) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Registration failed. Please try again."]);
}

$conn->close();
?>
