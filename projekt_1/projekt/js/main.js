const recipeList = document.getElementById('recipe-list');
const toggleDark = document.getElementById('toggle-dark');

// === Inicjalizacja ===
document.addEventListener('DOMContentLoaded', () => {
  loadRecipes();

  // Sprawdzamy preferencje użytkownika dla ciemnego trybu
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
  }

  const form = document.getElementById('recipe-form');

  form.addEventListener('input', (event) => {
    const target = event.target;
    const errorElement = target.nextElementSibling;

    if (target.validity.valid) {
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('error-message');
      }
    } else {
      if (!errorElement) {
        const error = document.createElement('span');
        error.className = 'error-message';
        target.insertAdjacentElement('afterend', error);
      }
      showError(target);
    }
  });

  form.addEventListener('submit', (event) => {
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;

    inputs.forEach((input) => {
      if (!input.validity.valid) {
        isValid = false;
        showError(input);
      }
    });

    if (!isValid) {
      event.preventDefault();
    }
  });

  function showError(input) {
    const errorElement = input.nextElementSibling;
    if (input.validity.valueMissing) {
      errorElement.textContent = 'To pole jest wymagane.';
    } else if (input.validity.tooShort) {
      errorElement.textContent = `Wartość musi mieć co najmniej ${input.minLength} znaków.`;
    } else if (input.validity.tooLong) {
      errorElement.textContent = `Wartość nie może przekraczać ${input.maxLength} znaków.`;
    } else if (input.validity.typeMismatch) {
      errorElement.textContent = 'Wprowadź poprawny format.';
    }
    errorElement.classList.add('error-message');
  }
});

// === Przełączanie trybu ciemnego ===
toggleDark.addEventListener('click', () => {
  // Przełączamy klasę dark-mode na <body>
  document.body.classList.toggle('dark-mode');
  
  // Zapisujemy stan trybu ciemnego w localStorage, aby utrzymać go po odświeżeniu
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
  } else {
    localStorage.setItem('darkMode', 'disabled');
  }
});

// === Ładowanie przepisów z TheMealDB ===
async function loadRecipes() {
  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=`;

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
      <img src="${meal.strMealThumb || 'default-image.jpg'}" alt="${meal.strMeal}" style="width: 100%; height: auto;" onerror="this.src='default-image.jpg';" />
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
