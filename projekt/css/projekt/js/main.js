// === Główna logika JS dla CookBook+ (z API TheMealDB) ===

const recipeList = document.getElementById('recipe-list');
const searchInput = document.getElementById('search');
const toggleDark = document.getElementById('toggle-dark');

// === Inicjalizacja ===
document.addEventListener('DOMContentLoaded', () => {
  loadRecipes();
});

// === Przełączanie trybu ciemnego ===
toggleDark.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark-mode');
});

// === Obsługa wyszukiwania ===
searchInput.addEventListener('input', loadRecipes);

// === Ładowanie przepisów z TheMealDB ===
async function loadRecipes() {
  const query = searchInput.value.trim();
  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Błąd ładowania danych z API.');

    const data = await res.json();
    const meals = data.meals || [];

    renderRecipes(meals);
  } catch (err) {
    recipeList.innerHTML = `<p class="error">Nie udało się pobrać danych: ${err.message}</p>`;
  }
}

// === Renderowanie przepisów ===
function renderRecipes(meals) {
  recipeList.innerHTML = '';

  if (meals.length === 0) {
    recipeList.innerHTML = '<p>Brak pasujących przepisów.</p>';
    return;
  }

  meals.forEach(meal => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
      <h3>${meal.strMeal}</h3>
      <p><strong>Kategoria:</strong> ${meal.strCategory || 'brak danych'}</p>
      <p><strong>Instrukcje:</strong><br>${meal.strInstructions?.split('\n').join('<br>') || 'brak instrukcji'}</p>
      <p><strong>Składniki:</strong><br>${formatIngredients(meal)}</p>
    `;
    recipeList.appendChild(card);
  });
}

// === Formatowanie składników z obiektu API ===
function formatIngredients(meal) {
  let ingredients = '';
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients += `- ${measure?.trim()} ${ingredient.trim()}<br>`;
    }
  }
  return ingredients || 'brak składników';
}
