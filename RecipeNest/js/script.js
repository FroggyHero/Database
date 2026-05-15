// ============================================================
// RecipeNest - script.js
// All API_BASE calls are placeholders — replace with your
// actual backend URL when the database is ready.
// ============================================================

const API_BASE = "http://localhost/RecipeNest/api";

// ============================================================
// BROWSE PAGE — Category Filter & Search
// ============================================================

function filterCategory(category, btn) {
    var buttons = document.querySelectorAll(".filter-btn");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("active");
    }
    btn.classList.add("active");

    var cards = document.querySelectorAll(".recipe-card-item");
    for (var j = 0; j < cards.length; j++) {
        if (category === "All" || cards[j].dataset.category === category) {
            cards[j].style.display = "block";
        } else {
            cards[j].style.display = "none";
        }
    }
}

function searchRecipes() {
    var input = document.getElementById("searchInput").value.toLowerCase();
    var cards = document.querySelectorAll(".recipe-card-item");

    for (var i = 0; i < cards.length; i++) {
        var title = cards[i].querySelector(".card-title").innerText.toLowerCase();
        if (title.includes(input)) {
            cards[i].style.display = "block";
        } else {
            cards[i].style.display = "none";
        }
    }
}

// ============================================================
// LOGIN FORM
// Sends: { email, password }
// Expects back: { success: true, user: { id, name } }
// On success: save user to sessionStorage, redirect to profile
// ============================================================

function validateLoginForm() {
    var email = document.getElementById("loginEmail").value.trim();
    var password = document.getElementById("loginPassword").value.trim();

    if (email === "") {
        showError("loginError", "Please enter your email.");
        return false;
    }
    if (password === "") {
        showError("loginError", "Please enter your password.");
        return false;
    }

    fetch(API_BASE + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.success) {
            sessionStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "profile.html";
        } else {
            showError("loginError", data.message || "Invalid email or password.");
        }
    })
    .catch(function() {
        showError("loginError", "Could not connect to the server. Please try again.");
    });

    return false;
}

// ============================================================
// REGISTER FORM
// Sends: { name, email, password }
// Expects back: { success: true }
// On success: redirect to login
// ============================================================

function validateRegisterForm() {
    var name = document.getElementById("regName").value.trim();
    var email = document.getElementById("regEmail").value.trim();
    var password = document.getElementById("regPassword").value.trim();
    var confirm = document.getElementById("regConfirm").value.trim();
    var agreed = document.getElementById("agreeTerms").checked;

    if (name === "") { alert("Please enter your name."); return false; }
    if (email === "") { alert("Please enter your email."); return false; }
    if (password === "") { alert("Please enter a password."); return false; }
    if (password !== confirm) { alert("Passwords do not match."); return false; }
    if (password.length < 6) { alert("Password must be at least 6 characters."); return false; }
    if (!agreed) { alert("You must agree to the Terms of Use."); return false; }

    fetch(API_BASE + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, email: email, password: password })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.success) {
            alert("Account created! Please log in.");
            window.location.href = "login.html";
        } else {
            alert(data.message || "Registration failed. Please try again.");
        }
    })
    .catch(function() {
        alert("Could not connect to the server. Please try again.");
    });

    return false;
}

// ============================================================
// SUBMIT RECIPE FORM
// Sends: { title, category, difficulty, prepTime, cookTime,
//          servings, description, ingredients, steps, userId }
// Expects back: { success: true, recipeId }
// On success: redirect to the new recipe page
// ============================================================

function validateRecipeForm() {
    var title       = document.getElementById("recipeTitle").value.trim();
    var category    = document.getElementById("recipeCategory").value;
    var difficulty  = document.getElementById("recipeDifficulty").value;
    var prepTime    = document.getElementById("prepTime").value;
    var cookTime    = document.getElementById("cookTime").value;
    var servings    = document.getElementById("servings").value;
    var description = document.getElementById("recipeDescription").value.trim();
    var ingredients = document.getElementById("recipeIngredients").value.trim();
    var steps       = document.getElementById("recipeSteps").value.trim();

    if (title === "")       { alert("Please enter a recipe title."); return false; }
    if (category === "")    { alert("Please select a category."); return false; }
    if (ingredients === "") { alert("Please enter the ingredients."); return false; }
    if (steps === "")       { alert("Please enter the preparation steps."); return false; }

    var user = JSON.parse(sessionStorage.getItem("user") || "null");
    if (!user) {
        alert("You must be logged in to submit a recipe.");
        window.location.href = "login.html";
        return false;
    }

    fetch(API_BASE + "/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId:      user.id,
            title:       title,
            category:    category,
            difficulty:  difficulty,
            prepTime:    prepTime,
            cookTime:    cookTime,
            servings:    servings,
            description: description,
            ingredients: ingredients,
            steps:       steps
        })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.success) {
            alert("Recipe submitted successfully!");
            window.location.href = "recipe.html?id=" + data.recipeId;
        } else {
            alert(data.message || "Submission failed. Please try again.");
        }
    })
    .catch(function() {
        alert("Could not connect to the server. Please try again.");
    });

    return false;
}

// ============================================================
// DELETE RECIPE
// Sends: DELETE /api/recipes/:id
// On success: removes the row from the table on the page
// ============================================================

function deleteRecipe(recipeId, rowElement) {
    if (!confirm("Are you sure you want to delete this recipe?")) return;

    fetch(API_BASE + "/recipes/" + recipeId, {
        method: "DELETE"
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.success) {
            rowElement.closest("tr").remove();
        } else {
            alert("Could not delete recipe. Please try again.");
        }
    })
    .catch(function() {
        alert("Could not connect to the server. Please try again.");
    });
}

// ============================================================
// SAVE TO FAVORITES
// Sends: { userId, recipeId }
// ============================================================

function saveToFavorites(recipeId) {
    var user = JSON.parse(sessionStorage.getItem("user") || "null");
    if (!user) {
        alert("You must be logged in to save favorites.");
        window.location.href = "login.html";
        return;
    }

    fetch(API_BASE + "/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, recipeId: recipeId })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.success) {
            alert("Recipe saved to favorites!");
        } else {
            alert(data.message || "Could not save to favorites.");
        }
    })
    .catch(function() {
        alert("Could not connect to the server. Please try again.");
    });
}

// ============================================================
// REMOVE FROM FAVORITES
// Sends: DELETE /api/favorites/:id
// ============================================================

function removeFromFavorites(favoriteId, cardElement) {
    if (!confirm("Remove from favorites?")) return;

    fetch(API_BASE + "/favorites/" + favoriteId, {
        method: "DELETE"
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.success) {
            cardElement.closest(".card").remove();
        } else {
            alert("Could not remove from favorites.");
        }
    })
    .catch(function() {
        alert("Could not connect to the server. Please try again.");
    });
}

// ============================================================
// LOGOUT
// ============================================================

function logout() {
    sessionStorage.removeItem("user");
    window.location.href = "index.html";
}

// ============================================================
// HELPER — show an inline error message
// ============================================================

function showError(elementId, message) {
    var el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.style.display = "block";
    }
}
