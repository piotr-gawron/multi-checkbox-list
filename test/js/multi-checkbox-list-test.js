let MultiCheckboxList = require('../../src/js/multi-checkbox-list');

let assert = require('chai').assert;
let expect = require('chai').expect;
let JSDOM = require('jsdom').JSDOM;

const FIXTURE_EMPTY_SELECT = '<select id="testSelect"/>';
const FIXTURE_TWO_OPTIONS_SELECT = '<select>' +
  '<option value="option1">Option 1</option>' +
  '<option value="option2">Option 2</option>' +
  '</select>';

const FIXTURE_ONE_OPTION_SELECT = '<select>' +
  '<option value="option1">Option 1</option>' +
  '</select>';

const CONTAINER_CLASS = 'multi-checkbox-list-container';

const SELECTED_ENTRY_CLASS = 'multi-checkbox-list-selected-entry';

describe('MultiCheckboxList', function () {

  let getFixture = function (fixture) {
    document.body.innerHTML = fixture;
    return document.body.firstChild;
  };

  function getCheckboxes() {
    let inputs = document.getElementsByTagName('input');
    let checkboxes = [];
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].type === 'checkbox') {
        checkboxes.push(inputs[i]);
      }
    }
    return checkboxes;
  }

  beforeEach(function () {
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
    // noinspection JSUnresolvedVariable
    global.window = dom.window;
    // noinspection JSUnresolvedVariable
    global.document = dom.window.document;
  });

  describe('constructor', function () {
    it('by DOM element', () => {
      let domObject = getFixture(FIXTURE_EMPTY_SELECT);
      let object = new MultiCheckboxList(domObject);
      assert.ok(object);
    });
    it('create header', () => {
      let domObject = getFixture(FIXTURE_EMPTY_SELECT);
      new MultiCheckboxList(domObject);
      assert.ok(document.body.innerHTML.indexOf("Available") >= 0, "List header doesn't exist");
    });
    it('create custom header', () => {
      let domObject = getFixture(FIXTURE_EMPTY_SELECT);
      new MultiCheckboxList(domObject, {listTitle: "TEST title"});
      assert.ok(document.body.innerHTML.indexOf("TEST title") >= 0, "List header doesn't exist");
    });
    it('css class', () => {
      let domObject = getFixture(FIXTURE_EMPTY_SELECT);
      new MultiCheckboxList(domObject);
      assert.equal(1, document.getElementsByClassName(CONTAINER_CLASS).length, "Created object doesn't contain proper css class");
    });

    it('create options', () => {
      let domObject = getFixture(FIXTURE_ONE_OPTION_SELECT);
      new MultiCheckboxList(domObject);
      let container = document.getElementsByClassName(CONTAINER_CLASS)[0];
      assert.ok(container.innerHTML.indexOf("Option 1") >= 0, "First option doesn't exist");
    });
    it('create selected options list', () => {
      let domObject = getFixture(FIXTURE_ONE_OPTION_SELECT);
      new MultiCheckboxList(domObject, {selectedList: true});
      let container = document.getElementsByClassName(CONTAINER_CLASS)[0];
      assert.ok(container.innerHTML.indexOf("Selected options") >= 0, "Selected options list not available");
    });
    it('create selected options list with custom title', () => {
      let domObject = getFixture(FIXTURE_ONE_OPTION_SELECT);
      new MultiCheckboxList(domObject, {selectedList: true, selectedTitle: "TEST title"});
      let container = document.getElementsByClassName(CONTAINER_CLASS)[0];
      assert.ok(container.innerHTML.indexOf("TEST title") >= 0, "Selected options list not available");
    });
    it('don\'t create selected options list', () => {
      let domObject = getFixture(FIXTURE_ONE_OPTION_SELECT);
      new MultiCheckboxList(domObject, {selectedList: false});
      let container = document.getElementsByClassName(CONTAINER_CLASS)[0];
      assert.ok(container.innerHTML.indexOf("Selected options") < 0, "Selected options list available, but shouldn't be");
    });

    it('create with predefined elements', () => {
      let domObject = getFixture(FIXTURE_EMPTY_SELECT);
      let checkboxList = new MultiCheckboxList(domObject, {
        entries: [{
          name: 'Option desc',
          value: 'option_desc',
          selected: true
        }, {
          name: 'Option desc 2',
          value: 'option_desc2',
          selected: false
        },
        ]
      });
      let container = document.getElementsByClassName(CONTAINER_CLASS)[0];
      assert.ok(container.innerHTML.indexOf("Option desc 2") >= 0, "Second option doesn't exist");
      assert.equal(1, checkboxList.getSelected().length);
      assert.equal('option_desc', checkboxList.getSelected()[0]);
    });

  });

  describe('getSelected', function () {
    it('after clicking checkbox', () => {
      let domObject = getFixture(FIXTURE_TWO_OPTIONS_SELECT);
      let multiCheckboxList = new MultiCheckboxList(domObject);

      let checkbox = getCheckboxes()[0];
      checkbox.click();

      assert.equal(1, multiCheckboxList.getSelected().length, 'Element wasn\'t selected');
    });
  });

  it('check visible selected options', () => {
    let domObject = getFixture(FIXTURE_TWO_OPTIONS_SELECT);
    new MultiCheckboxList(domObject, {selectedList: true});

    let checkboxes = getCheckboxes();
    checkboxes[0].click();
    checkboxes[1].click();

    assert.equal(2, document.getElementsByClassName(SELECTED_ENTRY_CLASS).length, 'Select element isn\'t visible');
    checkboxes[0].click();
    assert.equal(1, document.getElementsByClassName(SELECTED_ENTRY_CLASS).length, 'Select element shouldn\'t be visible');
  });

  describe('listeners', function () {
    describe('select', () => {
      it('synchronous code', () => {
        let domObject = getFixture(FIXTURE_TWO_OPTIONS_SELECT);
        let multiCheckboxList = new MultiCheckboxList(domObject);

        let elementSelected = false;
        multiCheckboxList.addListener("select", function () {
          elementSelected = true;
        });

        let checkbox = getCheckboxes()[0];
        checkbox.click();

        assert.ok(elementSelected, "Select listener wasn't called when expected");
      });
      it('async code', () => {
        let domObject = getFixture(FIXTURE_TWO_OPTIONS_SELECT);
        let multiCheckboxList = new MultiCheckboxList(domObject);

        let elementSelected = 0;
        for (let i = 0; i < 10; i++) {
          multiCheckboxList.addListener("select", function () {
            return new Promise(function (resolve) {
              elementSelected++;
              resolve();
            });
          });
        }

        let checkbox = getCheckboxes()[0];
        checkbox.click();

        assert.equal(10, elementSelected, "Select listener wasn't called when expected");
      });
      it('rejected promise', () => {
        let domObject = getFixture(FIXTURE_TWO_OPTIONS_SELECT);
        let multiCheckboxList = new MultiCheckboxList(domObject);

        multiCheckboxList.addListener("deselect", function () {
          return Promise.reject();
        });

        let checkbox = getCheckboxes()[0];
        return checkbox.onchange().then(function () {
          assert.fail();
        }, function () {
        });
      });
    });
    it('deselect', () => {
      let domObject = getFixture(FIXTURE_TWO_OPTIONS_SELECT);
      let multiCheckboxList = new MultiCheckboxList(domObject);

      let elementDeselected = false;
      multiCheckboxList.addListener("deselect", function () {
        elementDeselected = true;
      });

      let checkbox = getCheckboxes()[0];
      checkbox.click();
      assert.notOk(elementDeselected, "Deselect listener was called when not expected");

      checkbox.click();
      assert.ok(elementDeselected, "Deselect listener wasn't called when expected");
    });
    it('add invalid listener', () => {
      let domObject = getFixture(FIXTURE_TWO_OPTIONS_SELECT);
      let multiCheckboxList = new MultiCheckboxList(domObject);

      expect(function () {
        multiCheckboxList.addListener("invalid type");
      }).to.throw(Error);
    });
    it('call invalid listener', () => {
      let domObject = getFixture(FIXTURE_TWO_OPTIONS_SELECT);
      let multiCheckboxList = new MultiCheckboxList(domObject);

      expect(function () {
        multiCheckboxList.callListeners("invalid type");
      }).to.throw(Error);
    });
  });
});
