<?php
// ============================================================
// login.php — POST /api/login
// Logs in an existing user
// Expects: { email, password }
// Returns: { success, user: { id, name, email }, message? }
// ============================================================

require "headers.php";
require "db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data["email"]) || empty($data["password"])) {
    echo json_encode(["success" => false, "message" => "Email and password are required."]);
    exit();
}

$email = $conn->real_escape_string(trim($data["email"]));

$result = $conn->query("SELECT * FROM users WHERE email = '$email'");

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Invalid email or password."]);
    exit();
}

$user = $result->fetch_assoc();

if (!password_verify($data["password"], $user["password"])) {
    echo json_encode(["success" => false, "message" => "Invalid email or password."]);
    exit();
}

// Return user info (never return the password)
echo json_encode([
    "success" => true,
    "user" => [
        "id"    => $user["id"],
        "name"  => $user["name"],
        "email" => $user["email"]
    ]
]);

$conn->close();
?>
