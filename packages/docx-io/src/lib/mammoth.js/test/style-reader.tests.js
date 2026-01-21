var assert = require('assert');
var htmlPaths = require('../lib/styles/html-paths');
var documentMatchers = require('../lib/styles/document-matchers');
var styleReader = require('../lib/style-reader');
var results = require('../lib/results');
var test = require('./test')(module);

var readHtmlPath = styleReader.readHtmlPath;
var readDocumentMatcher = styleReader.readDocumentMatcher;
var readStyle = styleReader.readStyle;

test('styleReader.readHtmlPath', {
  'reads empty path'() {
    assertHtmlPath('', htmlPaths.empty);
  },

  'reads single element'() {
    assertHtmlPath('p', htmlPaths.elements(['p']));
  },

  'reads choice of elements'() {
    assertHtmlPath(
      'ul|ol',
      htmlPaths.elements([htmlPaths.element(['ul', 'ol'])])
    );
  },

  'reads nested elements'() {
    assertHtmlPath('ul > li', htmlPaths.elements(['ul', 'li']));
  },

  'reads class on element'() {
    var expected = htmlPaths.elements([
      htmlPaths.element('p', { class: 'tip' }),
    ]);
    assertHtmlPath('p.tip', expected);
  },

  'reads class with escaped colon'() {
    var expected = htmlPaths.elements([
      htmlPaths.element('p', { class: 'a:b' }),
    ]);
    assertHtmlPath('p.a\\:b', expected);
  },

  'reads multiple classes on element'() {
    var expected = htmlPaths.elements([
      htmlPaths.element('p', { class: 'tip help' }),
    ]);
    assertHtmlPath('p.tip.help', expected);
  },

  'reads attribute on element'() {
    var expected = htmlPaths.elements([htmlPaths.element('p', { lang: 'fr' })]);
    assertHtmlPath("p[lang='fr']", expected);
  },

  'reads multiple attributes on element'() {
    var expected = htmlPaths.elements([
      htmlPaths.element('p', { lang: 'fr', 'data-x': 'y' }),
    ]);
    assertHtmlPath("p[lang='fr'][data-x='y']", expected);
  },

  'reads when element must be fresh'() {
    var expected = htmlPaths.elements([
      htmlPaths.element('p', {}, { fresh: true }),
    ]);
    assertHtmlPath('p:fresh', expected);
  },

  'reads separator for elements'() {
    var expected = htmlPaths.elements([
      htmlPaths.element('p', {}, { separator: 'x' }),
    ]);
    assertHtmlPath("p:separator('x')", expected);
  },

  'reads separator with escape sequence'() {
    var expected = htmlPaths.elements([
      htmlPaths.element('p', {}, { separator: "\r\n\t'\\" }),
    ]);
    assertHtmlPath("p:separator('\\r\\n\\t\\'\\\\')", expected);
  },

  'reads ignore element'() {
    assertHtmlPath('!', htmlPaths.ignore);
  },
});

function assertHtmlPath(input, expected) {
  assert.deepEqual(readHtmlPath(input), results.success(expected));
}

test('styleReader.readDocumentMatcher', {
  'reads plain paragraph'() {
    assertDocumentMatcher('p', documentMatchers.paragraph());
  },

  'reads paragraph with style ID'() {
    assertDocumentMatcher(
      'p.Heading1',
      documentMatchers.paragraph({ styleId: 'Heading1' })
    );
  },

  'reads paragraph with exact style name'() {
    assertDocumentMatcher(
      "p[style-name='Heading 1']",
      documentMatchers.paragraph({
        styleName: documentMatchers.equalTo('Heading 1'),
      })
    );
  },

  'reads paragraph with style name prefix'() {
    assertDocumentMatcher(
      "p[style-name^='Heading']",
      documentMatchers.paragraph({
        styleName: documentMatchers.startsWith('Heading'),
      })
    );
  },

  'reads p:ordered-list(1) as ordered list with index of 0'() {
    assertDocumentMatcher(
      'p:ordered-list(1)',
      documentMatchers.paragraph({ list: { isOrdered: true, levelIndex: 0 } })
    );
  },

  'reads p:unordered-list(1) as unordered list with index of 0'() {
    assertDocumentMatcher(
      'p:unordered-list(1)',
      documentMatchers.paragraph({ list: { isOrdered: false, levelIndex: 0 } })
    );
  },

  'reads plain run'() {
    assertDocumentMatcher('r', documentMatchers.run());
  },

  'reads plain table'() {
    assertDocumentMatcher('table', documentMatchers.table());
  },

  'reads table with style ID'() {
    assertDocumentMatcher(
      'table.TableNormal',
      documentMatchers.table({
        styleId: 'TableNormal',
      })
    );
  },

  'reads table with style name'() {
    assertDocumentMatcher(
      "table[style-name='Normal Table']",
      documentMatchers.table({
        styleName: documentMatchers.equalTo('Normal Table'),
      })
    );
  },

  'reads bold'() {
    assertDocumentMatcher('b', documentMatchers.bold);
  },

  'reads italic'() {
    assertDocumentMatcher('i', documentMatchers.italic);
  },

  'reads underline'() {
    assertDocumentMatcher('u', documentMatchers.underline);
  },

  'reads strikethrough'() {
    assertDocumentMatcher('strike', documentMatchers.strikethrough);
  },

  'reads all-caps'() {
    assertDocumentMatcher('all-caps', documentMatchers.allCaps);
  },

  'reads small-caps'() {
    assertDocumentMatcher('small-caps', documentMatchers.smallCaps);
  },

  'reads highlight without color'() {
    assertDocumentMatcher('highlight', documentMatchers.highlight());
  },

  'reads highlight with color'() {
    assertDocumentMatcher(
      "highlight[color='yellow']",
      documentMatchers.highlight({ color: 'yellow' })
    );
  },

  'reads comment-reference'() {
    assertDocumentMatcher(
      'comment-reference',
      documentMatchers.commentReference
    );
  },

  'reads line breaks'() {
    assertDocumentMatcher("br[type='line']", documentMatchers.lineBreak);
  },

  'reads page breaks'() {
    assertDocumentMatcher("br[type='page']", documentMatchers.pageBreak);
  },

  'reads column breaks'() {
    assertDocumentMatcher("br[type='column']", documentMatchers.columnBreak);
  },
});

function assertDocumentMatcher(input, expected) {
  assert.deepEqual(readDocumentMatcher(input), results.success(expected));
}

test('styleReader.read', {
  'document matcher is mapped to HTML path using arrow'() {
    assertStyleMapping('p => h1', {
      from: documentMatchers.paragraph(),
      to: htmlPaths.elements(['h1']),
    });
  },

  'reads style mapping with no HTML path'() {
    assertStyleMapping('r =>', {
      from: documentMatchers.run(),
      to: htmlPaths.empty,
    });
  },

  'error when not all input is consumed'() {
    assert.deepEqual(
      readStyle('r => span a'),
      new results.Result(null, [
        results.warning(
          'Did not understand this style mapping, so ignored it: r => span a\nError was at character number 10: Expected end but got whitespace'
        ),
      ])
    );
  },
});

function assertStyleMapping(input, expected) {
  assert.deepEqual(readStyle(input), results.success(expected));
}
