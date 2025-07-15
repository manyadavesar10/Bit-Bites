// 🔊 Click Sound
function playClick() {
  const audio = document.getElementById("clickSound");
  if (audio) {
    audio.currentTime = 0;
    audio.play();
  }
}

// 🌙 Dark Mode Toggle
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

// 💾 Save, Unsave, and Load Favorites Logic
function isRecipeSaved(id) {
  let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  return favs.some(f => f.id === id);
}

function saveFavorite(id, name, img, button) {
  let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  if (!favs.find(f => f.id === id)) {
    favs.push({ id, name, img });
    localStorage.setItem("favorites", JSON.stringify(favs));

    if (button) {
      button.textContent = "🗑️ Unsave";
      button.onclick = () => unsaveFavorite(id, button);
    }
  }
}

function unsaveFavorite(id, button) {
  let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  favs = favs.filter(f => f.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favs));

  if (button) {
    button.textContent = "❤️ Save";
    button.onclick = () => saveFavorite(id, button.dataset.name, button.dataset.img, button);
  }
}

function loadFavorites() {
  const container = document.getElementById("favoritesGrid");
  if (!container) return;

  const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  container.innerHTML = "";

  if (!favs.length) {
    container.innerHTML = "<p>No favourites yet!</p>";
    return;
  }

  favs.forEach(meal => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <a href="https://www.themealdb.com/meal.php?c=${meal.id}" target="_blank">
        <img src="${meal.img}" />
        <h3>${meal.name}</h3>
      </a>
      <button onclick="unsaveFavorite('${meal.id}', this)">🗑️ Unsave</button>
    `;
    container.appendChild(card);
  });
}

// 🏠 Homepage Search + Recommended Section
function searchRecipes() {
  const input = document.getElementById("landingSearch");
  const query = input.value.trim();
  const resultsSection = document.getElementById("searchResultsSection");
  const resultsGrid = document.getElementById("searchResultsGrid");
  const recommendedGrid = document.getElementById("recommendedGrid");

  if (!query) return;

  // Clear previous results
  resultsGrid.innerHTML = "";
  recommendedGrid.innerHTML = "";
  resultsSection.style.display = "block";

  // Fetch search results
  fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
    .then(res => res.json())
    .then(data => {
      resultsGrid.innerHTML = "";

      if (!data.meals) {
        resultsGrid.innerHTML = `<p>No recipes found for "${query}".</p>`;
      } else {
        data.meals.forEach(meal => {
          const card = buildRecipeCard(meal);
          resultsGrid.appendChild(card);
        });
      }

      resultsSection.scrollIntoView({ behavior: "smooth" });

      // Fetch recommended recipes AFTER search results shown
      fetchRecommendedRecipes();
    });
}

// Build card for recipes
function buildRecipeCard(meal) {
  const card = document.createElement("div");
  card.className = "card";

  const link = document.createElement("a");
  link.href = `https://www.themealdb.com/meal.php?c=${meal.idMeal}`;
  link.target = "_blank";
  link.innerHTML = `
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
    <h3>${meal.strMeal}</h3>
  `;

  const button = document.createElement("button");
  const isSaved = isRecipeSaved(meal.idMeal);
  button.textContent = isSaved ? "🗑️ Unsave" : "❤️ Save";
  button.dataset.name = meal.strMeal;
  button.dataset.img = meal.strMealThumb;

  if (isSaved) {
    button.onclick = () => unsaveFavorite(meal.idMeal, button);
  } else {
    button.onclick = () => saveFavorite(meal.idMeal, meal.strMeal, meal.strMealThumb, button);
  }

  card.appendChild(link);
  card.appendChild(button);

  return card;
}

// Fetch and show recommended recipes (3-4 rows)
function fetchRecommendedRecipes() {
  const grid = document.getElementById("recommendedGrid");
  let count = 0;
  const totalRecipes = 20;  // Shows 5 rows (4 per row)

  grid.innerHTML = "";

  function fetchRandom() {
    if (count >= totalRecipes) return;

    fetch("https://www.themealdb.com/api/json/v1/1/random.php")
      .then(res => res.json())
      .then(data => {
        const meal = data.meals[0];
        const card = buildRecipeCard(meal);
        grid.appendChild(card);
        count++;
        fetchRandom();   // Keep fetching until 20 recipes
      });
  }

  fetchRandom();
}

// 📂 Load Favorites if on Favorites Page
if (document.getElementById("favoritesGrid")) {
  loadFavorites();
}
fetchRecommendedRecipes();
