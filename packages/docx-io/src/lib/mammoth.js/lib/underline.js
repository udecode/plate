var htmlPaths = require('./styles/html-paths');
var Html = require('./html');

exports.element = element;

function element(name) {
  return (html) => Html.elementWithTag(htmlPaths.element(name), [html]);
}
