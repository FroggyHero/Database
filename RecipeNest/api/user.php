<?php
// ============================================================
// user.php — User profile data
//
// GET /api/user.php?id=1  → get user profile info
// ============================================================

require "headers.php";
require "db.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method !== "GET") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed."]);
    exit();
}

if (empty($_GET["id"])) {
    echo json_encode(["success" => false, "message" => "User ID required."]);
    exit();
}

$userId = (int)$_GET["id"];

// Get user info
$result = $conn->query("
    SELECT id, name, email, created_at FROM users WHERE id = $userId
");

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found."]);
    exit();
}

$user = $result->fetch_assoc();

// Get recipe count
$recipeCount = $conn->query("
    SELECT COUNT(*) AS total FROM recipes WHERE user_id = $userId
")->fetch_assoc()["total"];

// Get favorites count
$favCount = $conn->query("
    SELECT COUNT(*) AS total FROM favorites WHERE user_id = $userId
")->fetch_assoc()["total"];

echo json_encode([
    "success"        => true,
    "user"           => $user,
    "recipe_count"   => $recipeCount,
    "favorite_count" => $favCount
]);

$conn->close();
?>
