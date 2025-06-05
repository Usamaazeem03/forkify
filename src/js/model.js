import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config'; // name import
// import { getJSON, sendJSON } from './helpers';
import { AJAX } from './helpers';

export const state = {
  recipe: {},
  search: {
    query: '',
    page: 1,
    results: [],
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

// create recipe object
export const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }), // optional chaining to add key if it exists
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

    // render recipe
    state.recipe = createRecipeObject(data);

    // add bookmark property
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    console.error(`${err} 💥💥💥`);
    throw err; // rethrow error
  }
};

// Search functionality
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1; // reset page to 1
  } catch (err) {
    console.error(`${err} 💥💥💥`);
    throw err; // rethrow error
  }
};

// Get search results for the current page
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage; //0
  const end = page * state.search.resultsPerPage; //9
  return state.search.results.slice(start, end);
};

// Update servings in the recipe state
export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    // newQt = oldQt *newServings / oldServings // 2 * 8/ 4 = 4
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings; // update servings in the state
};

// Persist bookmarks in local storage
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

// add bookmark functionality
export const addbookmark = function (recipe) {
  // add recipe to bookmarks
  state.bookmarks.push(recipe);
  // make current resipe bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistBookmarks(); // persist bookmarks in local storage
};
// delete bookmark functionality
export const deleteBookmark = function (id) {
  // delete recipe from bookmarks
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1); // remove the recipe from bookmarks
  // make current recipe not bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false; // if current recipe is deleted, set bookmarked to false
  persistBookmarks(); // persist bookmarks in local storage
};

// Restore bookmarks from local storage
const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

// upload own recipe functionality
export const uploadRecipe = async function (newRecipe) {
  try {
    // format ingredients
    // filter out empty ingredients {.startsWith('ingredient') &&}
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        const ingArr = ing[1].split(',').map(el => el.trim()); // remove spaces
        // check if ingredient is valid
        if (ingArr.length !== 3)
          throw new Error(
            'Worng ingredient format! Please use the correct format: "quantity,unit,description"'
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });
    // create new recipe object to send to the API
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients, // ingredients is an array of objects is formatted above
    };
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    // add recipe to bookmarks
    addbookmark(state.recipe);
  } catch (err) {
    console.error(`${err} 🔴`);
    throw err; // rethrow error
  }
};
