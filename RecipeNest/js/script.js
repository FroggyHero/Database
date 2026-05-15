// ============================================================
// RecipeNest - script.js
// ============================================================

const API_BASE = "http://localhost/RecipeNest/api";

// ============================================================
// Update navbar based on login status
// ============================================================

function updateNavbar() {
    var user = JSON.parse(sessionStorage.getItem("user") || "null");
    var navRight = document.querySelector(".nav-right");
    
    if (user && navRight) {
        // User is logged in - show My Profile and Log Out
        navRight.innerHTML = `
            <a href="profile.html">My Profile</a>
            <a href="#" onclick="logout(); return false;">Log Out</a>
        `;
    } else {
        // User is not logged in - show Log In and Sign Up
        navRight.innerHTML = `
            <a href="login.html">Log In</a>
            <a href="register.html">Sign Up</a>
        `;
    }
}

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

    fetch(API_BASE + "/login.php", {
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

    fetch(API_BASE + "/register.php", {
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

    fetch(API_BASE + "/recipes.php", {
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
// ============================================================

function deleteRecipe(recipeId, rowElement) {
    if (!confirm("Are you sure you want to delete this recipe?")) return;

    fetch(API_BASE + "/recipes.php?id=" + recipeId, {
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
// ============================================================

function saveToFavorites(recipeId) {
    var user = JSON.parse(sessionStorage.getItem("user") || "null");
    if (!user) {
        alert("You must be logged in to save favorites.");
        window.location.href = "login.html";
        return;
    }

    fetch(API_BASE + "/favorites.php", {
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
// ============================================================

function removeFromFavorites(favoriteId, cardElement) {
    if (!confirm("Remove from favorites?")) return;

    fetch(API_BASE + "/favorites.php?id=" + favoriteId, {
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

// ============================================================
// Load user profile name
// ============================================================

function loadProfileName() {
    var user = JSON.parse(sessionStorage.getItem("user") || "null");
    var profileName = document.getElementById("profileName");
    
    if (user && profileName) {
        profileName.textContent = user.name;
    }
}

// ============================================================
// Load profile page — own or public
// ============================================================

function loadProfile() {
    var loggedIn = JSON.parse(sessionStorage.getItem("user") || "null");
    var params = new URLSearchParams(window.location.search);
    var viewId = params.get("id") ? parseInt(params.get("id")) : null;

    // Determine whose profile to show
    var isOwnProfile = !viewId || (loggedIn && loggedIn.id == viewId);
    var userId = isOwnProfile ? (loggedIn ? loggedIn.id : null) : viewId;

    if (!userId) {
        document.getElementById("profileName").textContent = "Please log in to view your profile.";
        return;
    }

    // Adjust UI for own vs public
    if (isOwnProfile) {
        document.getElementById("profilePageTitle").textContent = "RecipeNest - My Profile";
        document.getElementById("recipesHeading").textContent = "My Recipes";
        document.getElementById("favoritesHeading").textContent = "Saved Favorites";
        document.getElementById("addRecipeBtn").style.display = "inline-block";
    } else {
        document.getElementById("profilePageTitle").textContent = "RecipeNest - Profile";
        document.getElementById("recipesHeading").textContent = "Recipes";
        document.getElementById("favoritesHeading").textContent = "Saved Favorites";
        document.getElementById("sidebarLinks").style.display = "none";
    }

    // Load user info
    fetch(API_BASE + "/user.php?id=" + userId)
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (!data.success) { document.getElementById("profileName").textContent = "User not found."; return; }
            document.getElementById("profileName").textContent = data.user.name;
            document.getElementById("profileMeta").textContent =
                data.recipe_count + " recipe" + (data.recipe_count !== 1 ? "s" : "") + " posted";
        });

    // Load recipes
    fetch(API_BASE + "/recipes.php?user_id=" + userId)
        .then(function(res) { return res.json(); })
        .then(function(data) {
            var container = document.getElementById("myRecipesContainer");
            if (!data.success || data.recipes.length === 0) {
                container.innerHTML = "<p style='color:#999;'>No recipes posted yet.</p>";
                return;
            }

            var rows = data.recipes.map(function(recipe) {
                var date = new Date(recipe.created_at).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
                var actions = isOwnProfile
                    ? `<a href="recipe.html?id=${recipe.id}" style="color:#8B4513; font-size:13px;">View</a> |
                       <a href="#" style="color:red; font-size:13px;" onclick="deleteRecipe(${recipe.id}, this); return false;">Delete</a>`
                    : `<a href="recipe.html?id=${recipe.id}" style="color:#8B4513; font-size:13px;">View</a>`;
                return `
                    <tr>
                        <td><a href="recipe.html?id=${recipe.id}" style="color:#8B4513;">${recipe.title}</a></td>
                        <td>${recipe.category}</td>
                        <td>${date}</td>
                        <td>${actions}</td>
                    </tr>
                `;
            }).join("");

            container.innerHTML = `
                <table>
                    <thead><tr><th>Recipe Name</th><th>Category</th><th>Date Posted</th><th>Actions</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
        })
        .catch(function() {
            document.getElementById("myRecipesContainer").innerHTML = "<p style='color:#999;'>Could not load recipes.</p>";
        });

    // Load favorites
    fetch(API_BASE + "/favorites.php?user_id=" + userId)
        .then(function(res) { return res.json(); })
        .then(function(data) {
            var container = document.getElementById("myFavoritesContainer");
            if (!data.success || data.favorites.length === 0) {
                container.innerHTML = "<p style='color:#999;'>No favorites saved yet.</p>";
                return;
            }

            container.innerHTML = data.favorites.map(function(fav) {
                var removeBtn = isOwnProfile
                    ? `<a href="#" class="btn btn-secondary" style="margin-left:8px; font-size:13px;"
                          onclick="removeFromFavorites(${fav.favorite_id}, this); return false;">Remove</a>`
                    : "";
                return `
                    <div class="card">
                        <div class="card-body">
                            <div class="card-category">${fav.category}</div>
                            <div class="card-title">${fav.title}</div>
                            <div class="card-description">${fav.description || "No description"}</div>
                            <div class="mt-10">
                                <a href="recipe.html?id=${fav.recipe_id}" class="btn btn-primary">View Recipe</a>
                                ${removeBtn}
                            </div>
                        </div>
                    </div>
                `;
            }).join("");
        })
        .catch(function() {
            document.getElementById("myFavoritesContainer").innerHTML = "<p style='color:#999;'>Could not load favorites.</p>";
        });
}

// ============================================================
// Load recipes from database
// ============================================================

function loadRecipes(containerId, limit = null, category = null) {
    var url = API_BASE + "/recipes.php";
    
    // Add query parameters
    var params = [];
    if (category) params.push("category=" + encodeURIComponent(category));
    if (params.length > 0) url += "?" + params.join("&");
    
    console.log("Loading recipes from:", url);
    
    fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(data) {
            console.log("Recipes data received:", data);
            
            if (data.success && data.recipes) {
                var recipes = data.recipes;
                console.log("Total recipes found:", recipes.length);
                
                // Limit if specified (for featured recipes)
                if (limit) recipes = recipes.slice(0, limit);
                
                var container = document.getElementById(containerId);
                console.log("Container element:", container);
                
                if (container) {
                    container.innerHTML = "";
                    
                    if (recipes.length === 0) {
                        container.innerHTML = "<p style='text-align:center; color:#999;'>No recipes found.</p>";
                        return;
                    }
                    
                    recipes.forEach(function(recipe) {
                        var totalTime = (parseInt(recipe.prep_time) || 0) + (parseInt(recipe.cook_time) || 0);
                        var html = `
                            <div class="recipe-card-item card" data-category="${recipe.category}" data-id="${recipe.id}">
                                <div class="card-body">
                                    <div class="card-category">${recipe.category}</div>
                                    <div class="card-title">${recipe.title}</div>
                                    <div class="card-description">${recipe.description || 'No description'}</div>
                                    <div class="card-meta">
                                        <span>${totalTime} min</span>
                                        <span>Serves ${recipe.servings || 1}</span>
                                    </div>
                                    <div class="mt-10">
                                        <a href="recipe.html?id=${recipe.id}" class="btn btn-primary">View Recipe</a>
                                    </div>
                                </div>
                            </div>
                        `;
                        container.innerHTML += html;
                        console.log("Added recipe:", recipe.title);
                    });
                    
                    // Update recipe count if element exists
                    var countEl = document.getElementById("recipeCount");
                    if (countEl) countEl.textContent = recipes.length;
                    
                    console.log("Total recipes displayed:", recipes.length);
                }
            } else {
                console.log("No success or recipes in response");
            }
        })
        .catch(function(err) {
            console.log("Error loading recipes:", err);
        });
}

// ============================================================
// Load single recipe page
// ============================================================

var currentRecipeId = null;

function loadRecipePage() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    if (!id) {
        document.getElementById("recipeTitle").textContent = "Recipe not found.";
        return;
    }
    currentRecipeId = id;

    fetch(API_BASE + "/recipes.php?id=" + id)
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (!data.success) {
                document.getElementById("recipeTitle").textContent = "Recipe not found.";
                return;
            }
            var r = data.recipe;
            var totalTime = (parseInt(r.prep_time) || 0) + (parseInt(r.cook_time) || 0);
            var date = new Date(r.created_at).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });

            // Page title
            document.getElementById("pageTitle").textContent = "RecipeNest - " + r.title;

            // Banner
            document.getElementById("breadcrumbTitle").textContent = r.title;
            document.getElementById("recipeCategory").textContent = r.category;
            document.getElementById("recipeTitle").textContent = r.title;
            document.getElementById("recipeAuthor").textContent = "Posted by: " + r.author_name;
            document.getElementById("recipeDate").textContent = date;
            document.getElementById("recipeTotalTime").textContent = totalTime || "—";
            document.getElementById("recipeServings").textContent = r.servings || "—";
            document.getElementById("recipeDifficulty").textContent = r.difficulty || "—";

            // Main content
            document.getElementById("recipeDescription").textContent = r.description || "";

            var ingredientsList = document.getElementById("recipeIngredients");
            ingredientsList.innerHTML = r.ingredients.split("\n").map(function(line) {
                return line.trim() ? "<li>" + line.trim() + "</li>" : "";
            }).join("");

            var stepsList = document.getElementById("recipeSteps");
            stepsList.innerHTML = r.steps.split("\n").filter(function(s) { return s.trim(); }).map(function(step, i) {
                return `<li><div class="step-num">${i + 1}</div><div>${step.trim()}</div></li>`;
            }).join("");

            // Made By sidebar
            var madeByBox = document.getElementById("madeByBox");
            if (madeByBox && r.author_name) {
                document.getElementById("madeByName").textContent = r.author_name;
                document.getElementById("madeByProfileLink").href = "profile.html?id=" + r.user_id;
                madeByBox.style.display = "block";
            }

            // Sidebar quick info
            document.getElementById("infoCategory").textContent = r.category;
            document.getElementById("infoPrepTime").textContent = (r.prep_time || 0) + " minutes";
            document.getElementById("infoCookTime").textContent = (r.cook_time || 0) + " minutes";
            document.getElementById("infoTotalTime").textContent = totalTime + " minutes";
            document.getElementById("infoServings").textContent = r.servings + " people";
            document.getElementById("infoDifficulty").textContent = r.difficulty;
        })
        .catch(function() {
            document.getElementById("recipeTitle").textContent = "Could not load recipe.";
        });
}

function saveFavoriteFromPage() {
    var user = JSON.parse(sessionStorage.getItem("user") || "null");
    if (!user) {
        alert("You must be logged in to save favorites.");
        window.location.href = "login.html";
        return;
    }
    if (!currentRecipeId) return;

    var btn = document.getElementById("saveFavBtn");
    btn.textContent = "Saving...";

    fetch(API_BASE + "/favorites.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, recipeId: currentRecipeId })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.success) {
            btn.textContent = "Saved!";
            btn.style.backgroundColor = "#8B4513";
            btn.style.color = "white";
        } else {
            btn.textContent = "Save to Favorites";
            alert(data.message || "Could not save to favorites.");
        }
    })
    .catch(function() {
        btn.textContent = "Save to Favorites";
        alert("Could not connect to the server.");
    });
}

// ============================================================
// Run on every page load
// ============================================================

document.addEventListener("DOMContentLoaded", function() {
    updateNavbar();
    loadProfileName();

    // Home page — load 3 featured recipes
    if (document.getElementById("featuredRecipesContainer")) {
        loadRecipes("featuredRecipesContainer", 3);
    }

    // Browse page — load all recipes
    if (document.getElementById("recipesContainer")) {
        loadRecipes("recipesContainer");
    }

    // Profile page — load user's recipes and favorites
    if (document.getElementById("myRecipesContainer")) {
        loadProfile();
    }

    // Recipe detail page
    if (document.getElementById("recipeTitle")) {
        loadRecipePage();
    }
});
