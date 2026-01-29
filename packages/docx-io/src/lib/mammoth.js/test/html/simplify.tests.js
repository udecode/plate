var assert = require('assert');

var _ = require('underscore');

var test = require('../test')(module);
var html = require('../../lib/html');
var htmlPaths = require('../../lib/styles/html-paths');

var nonFreshElement = html.nonFreshElement;
var text = html.text;

test('empty text nodes are removed', () => {
  assert.deepEqual(simplifyNode(text('')), []);
});

test('elements with no children are removed', () => {
  assert.deepEqual(simplifyNode(nonFreshElement('p', {}, [])), []);
});

test('elements only containing empty nodes are removed', () => {
  assert.deepEqual(simplifyNode(nonFreshElement('p', {}, [text('')])), []);
});

test('empty children of element are removed', () => {
  assert.deepEqual(
    simplifyNode(nonFreshElement('p', {}, [text('Hello'), text('')])),
    [nonFreshElement('p', {}, [text('Hello')])]
  );
});

test('empty void elements are not removed', () => {
  assert.deepEqual(simplifyNode(nonFreshElement('br', {}, [])), [
    nonFreshElement('br', {}, []),
  ]);
});

test('successive fresh elements are not collapsed', () => {
  var path = htmlPaths.elements([htmlPaths.element('p', {}, { fresh: true })]);
  var original = concat(
    pathToNodes(path, [text('Hello')]),
    pathToNodes(path, [text(' there')])
  );

  assert.deepEqual(html.simplify(original), original);
});

test('successive plain non-fresh elements are collapsed if they have the same tag name', () => {
  var path = htmlPaths.elements([htmlPaths.element('p', {}, { fresh: false })]);
  assert.deepEqual(
    html.simplify(
      concat(
        pathToNodes(path, [text('Hello')]),
        pathToNodes(path, [text(' there')])
      )
    ),
    pathToNodes(path, [text('Hello'), text(' there')])
  );
});

test('non-fresh can collapse into preceding fresh element', () => {
  var freshPath = htmlPaths.elements([
    htmlPaths.element('p', {}, { fresh: true }),
  ]);
  var nonFreshPath = htmlPaths.elements([
    htmlPaths.element('p', {}, { fresh: false }),
  ]);
  assert.deepEqual(
    html.simplify(
      concat(
        pathToNodes(freshPath, [text('Hello')]),
        pathToNodes(nonFreshPath, [text(' there')])
      )
    ),
    pathToNodes(freshPath, [text('Hello'), text(' there')])
  );
});

test('children of collapsed element can collapse with children of another collapsed element', () => {
  assert.deepEqual(
    html.simplify([
      nonFreshElement('blockquote', {}, [
        nonFreshElement('p', {}, [text('Hello')]),
      ]),
      nonFreshElement('blockquote', {}, [
        nonFreshElement('p', {}, [text('there')]),
      ]),
    ]),
    [
      nonFreshElement('blockquote', {}, [
        nonFreshElement('p', {}, [text('Hello'), text('there')]),
      ]),
    ]
  );
});

test('empty elements are removed before collapsing', () => {
  var freshPath = htmlPaths.elements([
    htmlPaths.element('p', {}, { fresh: true }),
  ]);
  var nonFreshPath = htmlPaths.elements([
    htmlPaths.element('p', {}, { fresh: false }),
  ]);
  assert.deepEqual(
    html.simplify(
      concat(
        pathToNodes(nonFreshPath, [text('Hello')]),
        pathToNodes(freshPath, []),
        pathToNodes(nonFreshPath, [text(' there')])
      )
    ),
    pathToNodes(nonFreshPath, [text('Hello'), text(' there')])
  );
});

test('when separator is present then separator is prepended to collapsed element', () => {
  var unseparatedPath = htmlPaths.elements([
    htmlPaths.element('pre', {}, { fresh: false }),
  ]);
  var separatedPath = htmlPaths.elements([
    htmlPaths.element('pre', {}, { fresh: false, separator: '\n' }),
  ]);
  assert.deepEqual(
    html.simplify(
      concat(
        pathToNodes(unseparatedPath, [text('Hello')]),
        pathToNodes(separatedPath, [text(' the'), text('re')])
      )
    ),
    pathToNodes(unseparatedPath, [
      text('Hello'),
      text('\n'),
      text(' the'),
      text('re'),
    ])
  );
});

function simplifyNode(node) {
  return html.simplify([node]);
}

function concat() {
  return _.flatten(arguments, true);
}

function pathToNodes(path, nodes) {
  return path.wrap(() => nodes);
}
