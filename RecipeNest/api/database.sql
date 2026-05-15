-- ============================================================
-- RecipeNest Database Schema
-- Run this in phpMyAdmin > SQL tab
-- ============================================================

CREATE DATABASE IF NOT EXISTS recipenest;
USE recipenest;

-- -------------------------------------------------------
-- Users table
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100)        NOT NULL,
    email      VARCHAR(150)        NOT NULL UNIQUE,
    password   VARCHAR(255)        NOT NULL,
    created_at DATETIME            NOT NULL
);

-- -------------------------------------------------------
-- Recipes table
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipes (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT                 NOT NULL,
    title       VARCHAR(200)        NOT NULL,
    category    VARCHAR(50)         NOT NULL,
    difficulty  VARCHAR(20)         NOT NULL DEFAULT 'Easy',
    prep_time   INT                          DEFAULT 0,
    cook_time   INT                          DEFAULT 0,
    servings    INT                          DEFAULT 1,
    description TEXT,
    ingredients TEXT                NOT NULL,
    steps       TEXT                NOT NULL,
    created_at  DATETIME            NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------
-- Favorites table
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS favorites (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT      NOT NULL,
    recipe_id  INT      NOT NULL,
    created_at DATETIME NOT NULL,
    UNIQUE KEY unique_favorite (user_id, recipe_id),
    FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- -------------------------------------------------------
-- Sample data (optional — delete if not needed)
-- -------------------------------------------------------

-- Sample user (password is: password123)
INSERT INTO users (name, email, password, created_at) VALUES
('Andrew Araujo', 'andrew@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW());

-- Sample recipes
INSERT INTO recipes (user_id, title, category, difficulty, prep_time, cook_time, servings, description, ingredients, steps, created_at) VALUES
(1, 'Spaghetti Carbonara', 'Dinner', 'Easy', 10, 20, 2,
 'A classic Roman pasta dish that is rich, creamy, and incredibly satisfying.',
 '200g spaghetti\n100g pancetta or guanciale, diced\n2 large eggs\n1 egg yolk\n50g Pecorino Romano cheese, grated\n50g Parmesan cheese, grated\n2 cloves of garlic\nSalt and black pepper to taste\n2 tablespoons olive oil',
 'Bring a large pot of salted water to a boil. Cook spaghetti until al dente. Save 1 cup pasta water before draining.\nFry the pancetta over medium heat until crispy. Add garlic, cook 1 minute, then remove garlic.\nWhisk together eggs, egg yolk, Pecorino Romano, and Parmesan. Season with black pepper.\nAdd drained pasta to the pan with pancetta (heat off). Pour egg mixture over pasta, tossing constantly.\nAdd pasta water a little at a time until you get a creamy sauce.\nServe immediately with extra black pepper and grated cheese.',
 NOW()),

(1, 'Banana Bread', 'Dessert', 'Easy', 15, 50, 8,
 'Moist and tender banana bread made with ripe bananas, butter, and brown sugar.',
 '3 ripe bananas\n1/3 cup melted butter\n3/4 cup sugar\n1 egg\n1 tsp vanilla\n1 tsp baking soda\nPinch of salt\n1 1/2 cups all-purpose flour',
 'Preheat oven to 350°F (175°C). Grease a 9x5 inch loaf pan.\nMash the bananas in a bowl. Mix in melted butter.\nStir in sugar, beaten egg, and vanilla.\nMix in baking soda and salt. Fold in flour until just combined.\nPour into prepared pan and bake 60-65 minutes.\nLet cool before slicing.',
 NOW()),

(1, 'Greek Salad', 'Lunch', 'Easy', 15, 0, 4,
 'Fresh tomatoes, cucumbers, olives, and feta cheese with olive oil dressing.',
 '4 tomatoes, chopped\n1 cucumber, sliced\n1 red onion, thinly sliced\n1 cup kalamata olives\n200g feta cheese, cubed\n3 tbsp olive oil\n1 tbsp red wine vinegar\nSalt, pepper, and oregano to taste',
 'Chop tomatoes, slice cucumber, and thinly slice the red onion.\nCombine vegetables and olives in a large bowl.\nAdd feta cheese on top.\nDrizzle with olive oil and red wine vinegar.\nSeason with salt, pepper, and oregano. Toss gently and serve.',
 NOW());

-- Sample favorites
INSERT INTO favorites (user_id, recipe_id, created_at) VALUES
(1, 2, NOW()),
(1, 3, NOW());
