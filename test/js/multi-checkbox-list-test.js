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

  describe('listeners', function () {
    it('select', () => {
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
