function playClick() {
  const audio = document.getElementById("clickSound");
  if (audio) {
    audio.currentTime = 0;
    audio.play();
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

// Search logic for index.html
function searchRecipes() {
  const input = document.getElementById("landingSearch");
  const query = input.value.trim();
  const section = document.getElementById("searchResultsSection");
  const grid = document.getElementById("searchResultsGrid");

  if (!query) return;

  grid.innerHTML = "";
  section.style.display = "block";

  fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
    .then(res => res.json())
    .then(data => {
      grid.innerHTML = "";

      if (!data.meals) {
        grid.innerHTML = `<p>No recipes found for "${query}".</p>`;
        return;
      }

      data.meals.forEach(meal => {
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
        grid.appendChild(card);
      });
    });
}

// Favourites
// 🔄 Check if recipe is saved
function isRecipeSaved(id) {
  let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  return favs.some(f => f.id === id);
}

// ❤️ Save the recipe + change button
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

// 🗑️ Unsave the recipe + change button
function unsaveFavorite(id, button) {
  let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  favs = favs.filter(f => f.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favs));

  if (button) {
    button.textContent = "❤️ Save";
    button.onclick = () => saveFavorite(id, button.dataset.name, button.dataset.img, button);
  }
}

// Auto-load on favourites.html
if (document.getElementById("favoritesGrid")) {
  loadFavorites();
}
function handleSearch(e) {
  e.preventDefault(); // Stop form from reloading the page
  playClick();
  searchRecipes();
}
