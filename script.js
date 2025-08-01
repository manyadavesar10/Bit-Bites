function playClick() {
  const audio = document.getElementById("clickSound");
  if (audio) {
    audio.currentTime = 0;
    audio.play();
  }
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
        <button onclick="saveFavorite('${mainMeal.idMeal}', '${mainMeal.strMeal}', '${mainMeal.strMealThumb}')">❤️ Save</button>
      `;
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
                <button onclick="saveFavorite('${meal.idMeal}', '${meal.strMeal}', '${meal.strMealThumb}')">❤️ Save</button>
              `;
              grid.appendChild(relCard);
            });
          }
        });

      section.scrollIntoView({ behavior: "smooth" });
    });
}
