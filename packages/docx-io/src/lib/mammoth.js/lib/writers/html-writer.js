var _ = require('underscore');

exports.writer = writer;

function writer(options) {
  options = options || {};
  if (options.prettyPrint) {
    return prettyWriter();
  }
  return simpleWriter();
}

var indentedElements = {
  div: true,
  p: true,
  ul: true,
  li: true,
};

function prettyWriter() {
  var indentationLevel = 0;
  var indentation = '  ';
  var stack = [];
  var start = true;
  var inText = false;

  var writer = simpleWriter();

  function open(tagName, attributes) {
    if (indentedElements[tagName]) {
      indent();
    }
    stack.push(tagName);
    writer.open(tagName, attributes);
    if (indentedElements[tagName]) {
      indentationLevel++;
    }
    start = false;
  }

  function close(tagName) {
    if (indentedElements[tagName]) {
      indentationLevel--;
      indent();
    }
    stack.pop();
    writer.close(tagName);
  }

  function text(value) {
    startText();
    var currentIndent = '';
    for (var i = 0; i < indentationLevel; i++) {
      currentIndent += indentation;
    }
    var text = isInPre() ? value : value.replace(/\n/g, '\n' + currentIndent);
    writer.text(text);
  }

  function selfClosing(tagName, attributes) {
    indent();
    writer.selfClosing(tagName, attributes);
  }

  function insideIndentedElement() {
    return stack.length === 0 || indentedElements[stack[stack.length - 1]];
  }

  function startText() {
    if (!inText) {
      indent();
      inText = true;
    }
  }

  function indent() {
    inText = false;
    if (!start && insideIndentedElement() && !isInPre()) {
      writer._append('\n');
      for (var i = 0; i < indentationLevel; i++) {
        writer._append(indentation);
      }
    }
  }

  function isInPre() {
    return _.some(stack, (tagName) => tagName === 'pre');
  }

  return {
    asString: writer.asString,
    open,
    close,
    text,
    selfClosing,
  };
}

function simpleWriter() {
  var fragments = [];

  function open(tagName, attributes) {
    var attributeString = generateAttributeString(attributes);
    fragments.push('<' + tagName + attributeString + '>');
  }

  function close(tagName) {
    fragments.push('</' + tagName + '>');
  }

  function selfClosing(tagName, attributes) {
    var attributeString = generateAttributeString(attributes);
    fragments.push('<' + tagName + attributeString + ' />');
  }

  function generateAttributeString(attributes) {
    return _.map(
      attributes,
      (value, key) => ' ' + key + '="' + escapeHtmlAttribute(value) + '"'
    ).join('');
  }

  function text(value) {
    fragments.push(escapeHtmlText(value));
  }

  function append(html) {
    fragments.push(html);
  }

  function asString() {
    return fragments.join('');
  }

  return {
    asString,
    open,
    close,
    text,
    selfClosing,
    _append: append,
  };
}

function escapeHtmlText(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlAttribute(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
