var _ = require('underscore');

exports.Element = Element;
exports.element = (name, attributes, children) =>
  new Element(name, attributes, children);
exports.text = (value) => ({
  type: 'text',
  value,
});

var emptyElement = (exports.emptyElement = {
  first() {
    return null;
  },
  firstOrEmpty() {
    return emptyElement;
  },
  attributes: {},
  children: [],
});

function Element(name, attributes, children) {
  this.type = 'element';
  this.name = name;
  this.attributes = attributes || {};
  this.children = children || [];
}

Element.prototype.first = function (name) {
  return _.find(this.children, (child) => child.name === name);
};

Element.prototype.firstOrEmpty = function (name) {
  return this.first(name) || emptyElement;
};

Element.prototype.getElementsByTagName = function (name) {
  var elements = _.filter(this.children, (child) => child.name === name);
  return toElementList(elements);
};

Element.prototype.text = function () {
  if (this.children.length === 0) {
    return '';
  }
  if (this.children.length !== 1 || this.children[0].type !== 'text') {
    throw new Error('Not implemented');
  }
  return this.children[0].value;
};

var elementListPrototype = {
  getElementsByTagName(name) {
    return toElementList(
      _.flatten(this.map((element) => element.getElementsByTagName(name), true))
    );
  },
};

function toElementList(array) {
  return _.extend(array, elementListPrototype);
}
