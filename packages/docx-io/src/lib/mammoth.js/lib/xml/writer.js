var _ = require('underscore');
var xmlbuilder = require('xmlbuilder');

exports.writeString = writeString;

function writeString(root, namespaces) {
  var uriToPrefix = _.invert(namespaces);

  var nodeWriters = {
    element: writeElement,
    text: writeTextNode,
  };

  function writeNode(builder, node) {
    var writer = nodeWriters[node.type];
    if (!writer) {
      throw new Error('Unknown node type: ' + node.type);
    }
    return writer(builder, node);
  }

  function writeElement(builder, element) {
    var elementBuilder = builder.element(
      mapElementName(element.name),
      element.attributes
    );
    element.children.forEach((child) => {
      writeNode(elementBuilder, child);
    });
  }

  function mapElementName(name) {
    var longFormMatch = /^\{(.*)\}(.*)$/.exec(name);
    if (longFormMatch) {
      var prefix = uriToPrefix[longFormMatch[1]];
      return prefix + (prefix === '' ? '' : ':') + longFormMatch[2];
    }
    return name;
  }

  function writeDocument(root) {
    var builder = xmlbuilder.create(mapElementName(root.name), {
      version: '1.0',
      encoding: 'UTF-8',
      standalone: true,
    });

    _.forEach(namespaces, (uri, prefix) => {
      var key = 'xmlns' + (prefix === '' ? '' : ':' + prefix);
      builder.attribute(key, uri);
    });

    // Apply root element attributes
    _.forEach(root.attributes, (value, key) => {
      builder.attribute(key, value);
    });

    root.children.forEach((child) => {
      writeNode(builder, child);
    });
    return builder.end();
  }

  return writeDocument(root);
}

function writeTextNode(builder, node) {
  builder.text(node.value);
}
