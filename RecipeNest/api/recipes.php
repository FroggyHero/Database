<?php
// ============================================================
// recipes.php — Recipe CRUD operations
//
// GET    /api/recipes.php              → get all recipes
// GET    /api/recipes.php?id=1         → get one recipe
// GET    /api/recipes.php?category=X   → filter by category
// GET    /api/recipes.php?user_id=1    → get recipes by user
// POST   /api/recipes.php              → create a new recipe
// DELETE /api/recipes.php?id=1         → delete a recipe
// ============================================================

require "headers.php";
require "db.php";

$method = $_SERVER["REQUEST_METHOD"];

// -------------------------------------------------------
// GET — Fetch recipes
// -------------------------------------------------------
if ($method === "GET") {

    // Get a single recipe by ID
    if (!empty($_GET["id"])) {
        $id = (int)$_GET["id"];
        $result = $conn->query("
            SELECT r.*, u.name AS author_name
            FROM recipes r
            JOIN users u ON r.user_id = u.id
            WHERE r.id = $id
        ");

        if ($result->num_rows === 0) {
            echo json_encode(["success" => false, "message" => "Recipe not found."]);
            exit();
        }

        $recipe = $result->fetch_assoc();
        echo json_encode(["success" => true, "recipe" => $recipe]);
        exit();
    }

    // Get recipes by user
    if (!empty($_GET["user_id"])) {
        $userId = (int)$_GET["user_id"];
        $result = $conn->query("
            SELECT * FROM recipes
            WHERE user_id = $userId
            ORDER BY created_at DESC
        ");

        $recipes = [];
        while ($row = $result->fetch_assoc()) {
            $recipes[] = $row;
        }
        echo json_encode(["success" => true, "recipes" => $recipes]);
        exit();
    }

    // Get all recipes, optionally filtered by category
    $where = "";
    if (!empty($_GET["category"])) {
        $category = $conn->real_escape_string($_GET["category"]);
        $where = "WHERE r.category = '$category'";
    }

    $result = $conn->query("
        SELECT r.id, r.title, r.category, r.difficulty, r.prep_time,
               r.cook_time, r.servings, r.description, r.created_at,
               u.name AS author_name
        FROM recipes r
        JOIN users u ON r.user_id = u.id
        $where
        ORDER BY r.created_at DESC
    ");

    $recipes = [];
    while ($row = $result->fetch_assoc()) {
        $recipes[] = $row;
    }

    echo json_encode(["success" => true, "recipes" => $recipes]);
    exit();
}

// -------------------------------------------------------
// POST — Create a new recipe
// Expects: { userId, title, category, difficulty, prepTime,
//            cookTime, servings, description, ingredients, steps }
// -------------------------------------------------------
if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    // Validate required fields
    $required = ["userId", "title", "category", "ingredients", "steps"];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            echo json_encode(["success" => false, "message" => "Missing required field: $field"]);
            exit();
        }
    }

    $userId      = (int)$data["userId"];
    $title       = $conn->real_escape_string(trim($data["title"]));
    $category    = $conn->real_escape_string(trim($data["category"]));
    $difficulty  = $conn->real_escape_string(trim($data["difficulty"] ?? "Easy"));
    $prepTime    = (int)($data["prepTime"] ?? 0);
    $cookTime    = (int)($data["cookTime"] ?? 0);
    $servings    = (int)($data["servings"] ?? 1);
    $description = $conn->real_escape_string(trim($data["description"] ?? ""));
    $ingredients = $conn->real_escape_string(trim($data["ingredients"]));
    $steps       = $conn->real_escape_string(trim($data["steps"]));

    $conn->query("
        INSERT INTO recipes
            (user_id, title, category, difficulty, prep_time, cook_time,
             servings, description, ingredients, steps, created_at)
        VALUES
            ($userId, '$title', '$category', '$difficulty', $prepTime, $cookTime,
             $servings, '$description', '$ingredients', '$steps', NOW())
    ");

    if ($conn->affected_rows > 0) {
        $newId = $conn->insert_id;
        echo json_encode(["success" => true, "recipeId" => $newId]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to submit recipe."]);
    }

    $conn->close();
    exit();
}

// -------------------------------------------------------
// DELETE — Delete a recipe by ID
// -------------------------------------------------------
if ($method === "DELETE") {
    if (empty($_GET["id"])) {
        echo json_encode(["success" => false, "message" => "Recipe ID required."]);
        exit();
    }

    $id = (int)$_GET["id"];

    // Also delete associated favorites
    $conn->query("DELETE FROM favorites WHERE recipe_id = $id");
    $conn->query("DELETE FROM recipes WHERE id = $id");

    if ($conn->affected_rows > 0) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Recipe not found or already deleted."]);
    }

    $conn->close();
    exit();
}

// Catch-all for unsupported methods
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed."]);
?>
