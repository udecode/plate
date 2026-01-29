var assert = require('assert');

var _ = require('underscore');

var documents = require('../lib/documents');
var transforms = require('../lib/transforms');
var test = require('./test')(module);

test('paragraph()', {
  'paragraph is transformed'() {
    var paragraph = documents.paragraph([]);
    var result = transforms.paragraph(() => documents.tab())(paragraph);
    assert.deepEqual(result, documents.tab());
  },

  'non-paragraph elements are not transformed'() {
    var run = documents.run([]);
    var result = transforms.paragraph(() => documents.tab())(run);
    assert.deepEqual(result, documents.run([]));
  },
});

test('run()', {
  'run is transformed'() {
    var run = documents.run([]);
    var result = transforms.run(() => documents.tab())(run);
    assert.deepEqual(result, documents.tab());
  },

  'non-run elements are not transformed'() {
    var paragraph = documents.paragraph([]);
    var result = transforms.run(() => documents.tab())(paragraph);
    assert.deepEqual(result, documents.paragraph([]));
  },
});

test('elements()', {
  'all descendants are transformed'() {
    var root = {
      children: [
        {
          children: [{}],
        },
      ],
    };
    var currentCount = 0;
    function setCount(node) {
      currentCount++;
      return _.extend(node, { count: currentCount });
    }

    var result = transforms._elements(setCount)(root);

    assert.deepEqual(result, {
      count: 3,
      children: [
        {
          count: 2,
          children: [{ count: 1 }],
        },
      ],
    });
  },
});

test('getDescendants()', {
  'returns nothing if element has no children property'() {
    assert.deepEqual(transforms.getDescendants({}), []);
  },

  'returns nothing if element has empty children'() {
    assert.deepEqual(transforms.getDescendants({ children: [] }), []);
  },

  'includes children'() {
    var element = {
      children: [{ name: 'child 1' }, { name: 'child 2' }],
    };
    assert.deepEqual(transforms.getDescendants(element), [
      { name: 'child 1' },
      { name: 'child 2' },
    ]);
  },

  'includes indirect descendants'() {
    var grandchild = { name: 'grandchild' };
    var child = { name: 'child', children: [grandchild] };
    var element = { children: [child] };
    assert.deepEqual(transforms.getDescendants(element), [grandchild, child]);
  },
});

test('getDescendantsOfType()', {
  'filters descendants to type'() {
    var paragraph = { type: 'paragraph' };
    var run = { type: 'run' };
    var element = {
      children: [paragraph, run],
    };
    assert.deepEqual(transforms.getDescendantsOfType(element, 'run'), [run]);
  },
});
