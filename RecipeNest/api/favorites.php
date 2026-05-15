<?php
// ============================================================
// favorites.php — Favorites CRUD
//
// GET    /api/favorites.php?user_id=1  → get user's favorites
// POST   /api/favorites.php            → add a favorite
// DELETE /api/favorites.php?id=1       → remove a favorite
// ============================================================

require "headers.php";
require "db.php";

$method = $_SERVER["REQUEST_METHOD"];

// -------------------------------------------------------
// GET — Get all favorites for a user
// -------------------------------------------------------
if ($method === "GET") {
    if (empty($_GET["user_id"])) {
        echo json_encode(["success" => false, "message" => "user_id is required."]);
        exit();
    }

    $userId = (int)$_GET["user_id"];

    $result = $conn->query("
        SELECT f.id AS favorite_id, r.id AS recipe_id, r.title,
               r.category, r.description, r.prep_time, r.cook_time, r.servings
        FROM favorites f
        JOIN recipes r ON f.recipe_id = r.id
        WHERE f.user_id = $userId
        ORDER BY f.created_at DESC
    ");

    $favorites = [];
    while ($row = $result->fetch_assoc()) {
        $favorites[] = $row;
    }

    echo json_encode(["success" => true, "favorites" => $favorites]);
    exit();
}

// -------------------------------------------------------
// POST — Add a recipe to favorites
// Expects: { userId, recipeId }
// -------------------------------------------------------
if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data["userId"]) || empty($data["recipeId"])) {
        echo json_encode(["success" => false, "message" => "userId and recipeId are required."]);
        exit();
    }

    $userId   = (int)$data["userId"];
    $recipeId = (int)$data["recipeId"];

    // Check if already favorited
    $check = $conn->query("
        SELECT id FROM favorites WHERE user_id = $userId AND recipe_id = $recipeId
    ");

    if ($check->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Recipe already in favorites."]);
        exit();
    }

    $conn->query("
        INSERT INTO favorites (user_id, recipe_id, created_at)
        VALUES ($userId, $recipeId, NOW())
    ");

    if ($conn->affected_rows > 0) {
        echo json_encode(["success" => true, "favoriteId" => $conn->insert_id]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to save favorite."]);
    }

    $conn->close();
    exit();
}

// -------------------------------------------------------
// DELETE — Remove a favorite by its ID
// -------------------------------------------------------
if ($method === "DELETE") {
    if (empty($_GET["id"])) {
        echo json_encode(["success" => false, "message" => "Favorite ID required."]);
        exit();
    }

    $id = (int)$_GET["id"];
    $conn->query("DELETE FROM favorites WHERE id = $id");

    if ($conn->affected_rows > 0) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Favorite not found."]);
    }

    $conn->close();
    exit();
}

// Catch-all
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed."]);
?>
