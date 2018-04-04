const CONTAINER_CLASS = 'multi-checkbox-list-container';

const LIST_CLASS = 'multi-checkbox-list-list';

const ENTRY_LIST_TITLE_CLASS = 'multi-checkbox-list-title';
const ENTRY_CLASS = 'multi-checkbox-list-entry';
const ENTRY_LIST_CLASS = 'multi-checkbox-list-entry-list';

const SELECTED_TITLE_CLASS = 'multi-checkbox-list-selected-title';
const SELECTED_ENTRY_CLASS = 'multi-checkbox-list-selected-entry';
const SELECTED_LIST_CLASS = 'multi-checkbox-list-selected-entry-list';


class MultiCheckboxList {
  constructor(selector, options = {}) {
    this.setOptions(options);
    this.buildGui(selector);
    this.addCheckboxes(selector.getElementsByTagName('option'))
  }

  setOptions(options) {
    options.listTitle = options.listTitle !== undefined ? options.listTitle : 'Available options';
    options.selectedList = options.selectedList !== undefined ? options.selectedList : false;
    options.selectedTitle = options.selectedTitle !== undefined ? options.selectedTitle : "Selected options";
    options.entries = options.entries !== undefined ? options.entries : [];

    this.options = options;

    this.listeners = {
      'select': [],
      'deselect': []
    };

  }

  buildGui(selectElement) {
    let self = this;
    selectElement.style.display = 'none';

    this.containerDiv = document.createElement('div');
    this.containerDiv.classList.add(CONTAINER_CLASS);
    selectElement.parentNode.insertBefore(this.containerDiv, selectElement);

    let listContainer = document.createElement('div');
    listContainer.classList.add(LIST_CLASS);

    this.containerDiv.appendChild(listContainer);

    this.headerListDiv = document.createElement('div');
    this.headerListDiv.innerHTML = this.options.listTitle;
    this.headerListDiv.classList.add(ENTRY_LIST_TITLE_CLASS);
    listContainer.appendChild(this.headerListDiv);

    this.optionListDiv = document.createElement('div');
    this.optionListDiv.classList.add(ENTRY_LIST_CLASS);
    listContainer.appendChild(this.optionListDiv);

    if (this.options.selectedList) {
      let selectedContainer = document.createElement('div');
      selectedContainer.classList.add(LIST_CLASS);

      this.containerDiv.appendChild(selectedContainer);

      this.selectedHeaderListDiv = document.createElement('div');
      this.selectedHeaderListDiv.innerHTML = this.options.selectedTitle;
      this.selectedHeaderListDiv.classList.add(SELECTED_TITLE_CLASS);
      selectedContainer.appendChild(this.selectedHeaderListDiv);

      this.selectedOptionListDiv = document.createElement('div');
      this.selectedOptionListDiv.classList.add(SELECTED_LIST_CLASS);
      selectedContainer.appendChild(this.selectedOptionListDiv);
      this.addListener("select", function (element) {
        self.addSelectedEntry(element);
        for (let i = 0; i < self.options.entries.length; i++) {
          let option = self.options.entries[i];
          if (option.value === element.value) {
            option.selected = true;
          }
        }
      });
      this.addListener("deselect", function (element) {
        let nodes = self.selectedOptionListDiv.childNodes;
        for (let i = nodes.length - 1; i >= 0; i--) {
          if (nodes[i].innerHTML === element.name) {
            self.selectedOptionListDiv.removeChild(nodes[i]);
          }
        }
        for (let i = 0; i < self.options.entries.length; i++) {
          let option = self.options.entries[i];
          if (option.value === element.value) {
            option.selected = false;
          }
        }
      });
    }
  }

  addSelectedEntry(entry) {
    if (this.options.selectedList) {
      let selectedDiv = document.createElement("div");
      selectedDiv.innerHTML = entry.name;
      selectedDiv.classList.add(SELECTED_ENTRY_CLASS);
      this.selectedOptionListDiv.appendChild(selectedDiv);
    }
  }

  addCheckboxes(htmlOptions) {
    for (let i = 0; i < this.options.entries.length; i++) {
      let option = this.options.entries[i];
      this.optionListDiv.appendChild(this.createCheckboxEntry(option.value, option.name, option.selected));
    }
    for (let i = 0; i < htmlOptions.length; i++) {
      let option = htmlOptions[i];
      let value = option.value;
      let name = option.innerHTML;
      this.options.entries.push({value: value, name: name, selected: false});
      this.optionListDiv.appendChild(this.createCheckboxEntry(value, name))
    }
  }

  createCheckboxEntry(value, name, selected) {
    let self = this;
    let checkboxDivContainer = document.createElement('div');
    checkboxDivContainer.classList.add(ENTRY_CLASS);

    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = value;
    if (selected) {
      checkbox.checked = true;
      self.addSelectedEntry({value: value, name: name});
    }
    checkbox.onchange = function () {
      let name;
      for (let i = 0; i < checkbox.parentNode.childNodes.length; i++) {
        let node = checkbox.parentNode.childNodes[i];
        if (node.nodeName.toLowerCase() === "div") {
          name = node.innerHTML;
        }
      }
      if (this.checked) {
        self.callListeners('select', {value: this.value, name: name});
      } else {
        self.callListeners('deselect', {value: this.value, name: name});
      }
    };

    checkboxDivContainer.appendChild(checkbox);

    let description = document.createElement('div');
    description.innerHTML = name;
    checkboxDivContainer.appendChild(description);
    return checkboxDivContainer;
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