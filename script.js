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

function searchRecipes() {
  const input = document.getElementById("landingSearch");
  const query = input.value.trim();
  const section = document.getElementById("searchResultsSection");
  const grid = document.getElementById("searchResultsGrid");
  const loader = document.getElementById("loader");

  if (!query) {
  const grid = document.getElementById("searchResultsGrid");
  grid.innerHTML = "<p>Please enter a recipe name first.</p>";
  document.getElementById("searchResultsSection").style.display = "block";
  return;
}


  grid.innerHTML = "";
  section.style.display = "block";
  loader.style.display = "block";

  fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
    .then(res => res.json())
    .then(data => {
      loader.style.display = "none";
      if (!data.meals) {
        grid.innerHTML = `<p>No results found for "${query}" 😢</p>`;
        return;
      }

      // 1️⃣ Add the main searched meal
      const mainMeal = data.meals[0];
      const card = document.createElement("div");
card.className = "card";
card.innerHTML = `
  <a href="https://www.themealdb.com/meal.php?c=${mainMeal.idMeal}" target="_blank">
    <img src="${mainMeal.strMealThumb}" />
    <h3>${mainMeal.strMeal}</h3>
  </a>
`;

const button = document.createElement("button");
const isSaved = isRecipeSaved(mainMeal.idMeal);
button.textContent = isSaved ? "🗑️ Unsave" : "❤️ Save";
button.dataset.name = mainMeal.strMeal;
button.dataset.img = mainMeal.strMealThumb;

if (isSaved) {
  button.onclick = () => unsaveFavorite(mainMeal.idMeal, button);
} else {
  button.onclick = () => saveFavorite(mainMeal.idMeal, mainMeal.strMeal, mainMeal.strMealThumb, button);
}

card.appendChild(button);

      grid.appendChild(card);

      // 2️⃣ Now fetch related meals by same category
      fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${mainMeal.strCategory}`)
        .then(res => res.json())
        .then(relatedData => {
          if (relatedData.meals) {
            const relatedMeals = relatedData.meals
              .filter(m => m.idMeal !== mainMeal.idMeal)
              .slice(0, 7); // up to 7 related meals

            relatedMeals.forEach(meal => {
              const relCard = document.createElement("div");
relCard.className = "card";
relCard.innerHTML = `
  <a href="https://www.themealdb.com/meal.php?c=${meal.idMeal}" target="_blank">
    <img src="${meal.strMealThumb}" />
    <h3>${meal.strMeal}</h3>
  </a>
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

relCard.appendChild(button);

              grid.appendChild(relCard);
            });
          }
        });

      section.scrollIntoView({ behavior: "smooth" });
    });
}
// Favourites
function isRecipeSaved(id) {
  let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  return favs.some(f => f.id === id);
}

function saveFavorite(id, name, img, button) {
  let favs = JSON.parse(localStorage.getItem("favorites") || "[]");

  if (!favs.find(f => f.id === id)) {
    favs.push({ id, name, img });
    localStorage.setItem("favorites", JSON.stringify(favs));
  }

  if (button) {
    button.textContent = "🗑️ Unsave";
    button.onclick = () => unsaveFavorite(id, button);
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
  const favs = JSON.parse(localStorage.getItem("favorites") || "[]");

  if (!favs.length) {
    container.innerHTML = "<p>No favourites yet!</p>";
    return;
  }

  container.innerHTML = "";
  favs.forEach(meal => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <a href="https://www.themealdb.com/meal.php?c=${meal.id}" target="_blank">
        <img src="${meal.img}" />
        <h3>${meal.name}</h3>
      </a>
    `;

    const button = document.createElement("button");
    button.textContent = "🗑️ Unsave";
    button.onclick = () => {
      unsaveFavorite(meal.id, button);
      loadFavorites(); // Refresh the list after removing
    };
    card.appendChild(button);
    container.appendChild(card);
  });
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
function toggleMenu() {
  const nav = document.getElementById("navLinks");
  nav.classList.toggle("show");
}
