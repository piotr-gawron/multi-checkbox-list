const CONTAINER_CLASS = 'multi-checkbox-list-container';
const LIST_TITLE_CLASS = 'multi-checkbox-list-title';
const ENTRY_CLASS = 'multi-checkbox-list-entry';
const LIST_CLASS = 'multi-checkbox-list-entry-list';

class MultiCheckboxList {
  constructor(selector, options = {}) {
    this.setOptions(options);
    this.buildGui(selector);
    this.addCheckboxes(selector.getElementsByTagName('option'))
  }

  setOptions(options) {
    options.listTitle = options.listTitle ? options.listTitle : 'Available options';

    this.options = options;

    this.listeners = {
      'select': [],
      'deselect': []
    };

  }

  buildGui(selectElement) {
    selectElement.style.display = 'none';

    this.containerDiv = document.createElement('div');
    this.containerDiv.classList.add(CONTAINER_CLASS);
    selectElement.parentNode.insertBefore(this.containerDiv, selectElement);

    this.headerListDiv = document.createElement('div');
    this.headerListDiv.innerHTML = this.options.listTitle;
    this.headerListDiv.classList.add(LIST_TITLE_CLASS);
    this.containerDiv.appendChild(this.headerListDiv);

    this.optionListDiv = document.createElement('div');
    this.optionListDiv.classList.add(LIST_CLASS);
    this.containerDiv.appendChild(this.optionListDiv);

  }

  addCheckboxes(htmlOptions) {
    let self = this;
    for (let i = 0; i < htmlOptions.length; i++) {
      let option = htmlOptions[i];
      let checkboxDivContainer = document.createElement('div');
      checkboxDivContainer.classList.add(ENTRY_CLASS);

      let checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = option.value;
      checkbox.onchange = function () {
        if (this.checked) {
          self.callListeners('select', this.value);
        } else {
          self.callListeners('deselect', this.value);
        }
      };

      checkboxDivContainer.appendChild(checkbox);

      let description = document.createElement('div');
      description.innerHTML = option.innerHTML;
      checkboxDivContainer.appendChild(description);

      this.optionListDiv.appendChild(checkboxDivContainer)
    }
  }

  getSelected() {
    let result = [];
    let checkboxes = this.optionListDiv.getElementsByTagName('input');
    for (let i = 0; i < checkboxes.length; i++) {
      let checkbox = checkboxes[i];
      if (checkbox.checked) {
        result.push(checkbox.value);
      }
    }
    return result;
  }

  addListener(type, listener) {
    if (this.listeners[type] === undefined) {
      throw new Error('Unknown listener type: ' + type);
    }
    this.listeners[type].push(listener);
  }

  callListeners(type, element) {
    if (this.listeners[type] === undefined) {
      throw new Error('Unknown listener type: ' + type);
    }
    for (let i = 0; i < this.listeners[type].length; i++) {
      this.listeners[type][i](element);
    }
  }
}

module.exports = MultiCheckboxList;