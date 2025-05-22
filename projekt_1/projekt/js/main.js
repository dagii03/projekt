// Pobiera listę przepisów z API i wyświetla je na stronie
// oraz inicjalizuje tryb ciemny i walidację formularza
const recipeList = document.getElementById('recipe-list');
const toggleDark = document.getElementById('toggle-dark');
let allRecipes = [];

// === Inicjalizacja ===
// Po załadowaniu DOM ładuje przepisy, ustawia tryb ciemny i obsługuje formularz
// (walidacja pól formularza)
document.addEventListener('DOMContentLoaded', () => {
  loadRecipes();

  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
  }

  const form = document.getElementById('recipe-form');
  if (form) {
    // Obsługa walidacji pól formularza na bieżąco
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

    // Obsługa walidacji przy wysyłaniu formularza
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
  }
});

// Wyświetla komunikat o błędzie pod polem formularza
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

// === Tryb ciemny ===
// Przełącza tryb ciemny i zapisuje preferencję w localStorage
if (toggleDark) {
  toggleDark.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
  });
}

// === Ładowanie przepisów ===
// Pobiera przepisy z zewnętrznego API i wywołuje renderowanie oraz kategorie
async function loadRecipes() {
  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Błąd ładowania danych z API.');
    const data = await res.json();

    allRecipes = data.meals || [];
    populateCategories(allRecipes);
    renderRecipes(allRecipes);
  } catch (err) {
    recipeList.innerHTML = `<p class="error">Nie udało się pobrać danych: ${err.message}</p>`;
  }
}

// === Renderowanie przepisów ===
// Tworzy i wyświetla karty przepisów na podstawie przekazanej listy
function renderRecipes(meals) {
  if (!recipeList) return;

  recipeList.innerHTML = '';

  if (!meals.length) {
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

// === Składniki ===
// Formatuje listę składników i miar dla danego przepisu
function formatIngredients(meal) {
  let ingredients = '';
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients += `- ${measure?.trim() || ''} ${ingredient.trim()}<br>`;
    }
  }
  return ingredients || 'brak składników';
}

// === Kategorie ===
// Wypełnia select z kategoriami na podstawie pobranych przepisów
function populateCategories(recipes) {
  const categorySelect = document.getElementById('category');
  if (!categorySelect) return;

  const categories = [...new Set(recipes.map(r => r.strCategory))];
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
}

// === Filtrowanie ===
// Filtrowanie przepisów po kategorii i składniku, a następnie renderowanie wyników
function applyFilters() {
  const category = document.getElementById("category").value;
  const ingredient = document.getElementById("ingredient").value.trim().toLowerCase();

  let filtered = [...allRecipes];

  if (category) {
    filtered = filtered.filter(r => r.strCategory === category);
  }

  if (ingredient) {
    filtered = filtered.filter(meal => {
      for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`];
        if (ing && ing.toLowerCase().includes(ingredient)) return true;
      }
      return false;
    });
  }

  renderRecipes(filtered);
}

// Inicjalizuje obsługę formularzy i walidację po załadowaniu DOM
document.addEventListener("DOMContentLoaded", () => {
  const recipeForm = document.getElementById('recipe-form');
  const courseForm = document.getElementById('course-form');

  if (recipeForm) {
    // Walidacja formularza przepisu na bieżąco
    recipeForm.addEventListener('input', (event) => {
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

    // Walidacja przy wysyłaniu formularza przepisu
    recipeForm.addEventListener('submit', (event) => {
      const inputs = recipeForm.querySelectorAll('input, textarea, select');
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
  }

  if (courseForm) {
    // Zapobiega domyślnej wysyłce formularza kursu
    courseForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("OK! Formularz został pomyślnie wysłany.");
      courseForm.reset();
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("OK! Formularz został pomyślnie wysłany.");
      form.reset();
    });
  }
});
