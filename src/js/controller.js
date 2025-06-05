import * as model from './model.js'; // import model to access the state and functions
import { MODAL_CLOSE_SEC } from './config.js'; // To close the modal after a certain time
import recipeView from './views/recipeView.js'; // import recipeView to render the recipe
import searchView from './views/searchView.js'; // import searchView to get the search query
import resultsView from './views/resultsView.js'; // import resultsView to render the search results
import bookmarksView from './views/bookmarksView.js'; // import bookmarksView to render the bookmarks
import paginationView from './views/paginationView.js'; // import paginationView to handle pagination
import addRecipeView from './views/addRecipeView.js'; // import AddRecipeView to handle adding recipes

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

// hot module replacement
if (module.hot) {
  module.hot.accept();
}

////////////////////////////////////////
// CONTROLLER
// controlRecipes function to load and render the recipe
const controlRecipes = async function () {
  try {
    // update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    // update bookmarks view to mark selected bookmark
    bookmarksView.update(model.state.bookmarks);
    // get id from url
    const id = window.location.hash.slice(1);

    // guard clause
    if (!id) return;

    recipeView.renderSpinner(); // loading spinner
    // loading recipe
    await model.loadRecipe(id);
    const { recipe } = model.state;

    // render recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};
// load search results
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner(); // loading spinner
    // get query from search view
    const query = searchView.getQuery();
    // guard clause
    if (!query) return;

    //load search results
    await model.loadSearchResults(query);
    // render results
    resultsView.render(model.getSearchResultsPage());
    // render pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = function (goToPage) {
  // render new results
  resultsView.render(model.getSearchResultsPage(goToPage));
  // render new pagination
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // update the recipe servings in the state
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addbookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id); // toggle bookmarked state
  // update recipe view
  recipeView.update(model.state.recipe);
  // render bookmarks view
  bookmarksView.render(model.state.bookmarks);
};
// load bookmarks on page load
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};
// add recipe
const controlAddRecipe = async function (newRecipe) {
  try {
    // show loading spinner
    addRecipeView.renderSpinner(); // render loading spinner
    // upload the new recipe data
    await model.uploadRecipe(newRecipe);
    // render the new upload recipe
    recipeView.render(model.state.recipe);
    // success message
    addRecipeView.renderMessage(); // render success message
    // render bookmarks view
    bookmarksView.render(model.state.bookmarks); // render bookmarks view with new recipe
    // change ID in the URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // pushState(state, 'titel', `#${model.state.recipe.id}`);
    // close the upload window
    setTimeout(function () {
      addRecipeView.toggleWindow(); // close the add recipe window
    }, MODAL_CLOSE_SEC * 1000); // close after 2.5 seconds
  } catch (err) {
    console.error('🔴', err);
    addRecipeView.renderError(err.message); // render error message
  }
};

// publish/subscribe pattern
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks); // render bookmarks on load
  recipeView.addHandlerRender(controlRecipes); // render recipe on load and hashchange
  recipeView.addHandlerUpdateServings(controlServings); // update servings on click
  recipeView.addHandlerAddBookmark(controlAddBookmark); // add bookmark on click
  searchView.addHandlerSearch(controlSearchResults); // search results on submit
  paginationView.addHandlerClick(controlPagination); // pagination on click
  addRecipeView.addHandlerUpload(controlAddRecipe); // add recipe on submit
};
init();
