import icons from 'url:../../img/icons.svg';
export default class View {
  _data;
  // jsdoc comments for the class
  /**
   * Render the view to the DOM
   * @param {Object | Objet[]} data The data to be rendered(e.g. recipe, search results)
   * @param {boolean} [render = true] If false, create markup string instead of rendering to the DOM
   * @returns{undefined | string} If render is false, return the markup string
   * @this {Object} View instance
   * @author Usama
   * @todo Finish implementation
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();
    this._data = data;
    const markup = this._generateMarkup();
    // if render is false, return the markup
    if (!render) return markup;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
  _clear() {
    this._parentElement.innerHTML = '';
  }

  // update the view with new data
  update(data) {
    this._data = data;
    // create a new markup
    const newMarkup = this._generateMarkup();
    // create a new DOM parser
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    // get all the new elements
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    // get all the current elements
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));
    // loop through the new elements and update the current elements
    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      // update changed text
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        curEl.textContent = newEl.textContent;
      }
      // update changed attributes
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach(atte => {
          curEl.setAttribute(atte.name, atte.value);
        });
      }
    });
  }
  // render spinner
  renderSpinner = function () {
    const markup = `
    <div class="spinner">
            <svg>
              <use href="${icons}#icon-loader"></use>
            </svg>
          </div> `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  };

  // render error
  renderError(message = this._errorMessage) {
    const markup = `
      <div class="error">
              <div>
                <svg>
                  <use href="${icons}#icon-alert-triangle"></use>
                </svg>
              </div>
              <p>${message}</p>
            </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // success massage
  renderMessage(message = this._message) {
    const markup = `
      <div class="message">
              <div>
                <svg>
                  <use href="${icons}#icon-smile"></use>
                </svg>
              </div>
              <p>${message}</p>
            </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
