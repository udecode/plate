var assert = require('assert');

var hamjest = require('hamjest');
var assertThat = hamjest.assertThat;
var contains = hamjest.contains;
var equalTo = hamjest.equalTo;
var hasProperties = hamjest.hasProperties;

var mammoth = require('../');
var documents = require('../lib/documents');
var promises = require('../lib/promises');

var test = require('./test')(module);

test('mammoth.images.inline() should be an alias of mammoth.images.imgElement()', () => {
  assert.ok(mammoth.images.inline === mammoth.images.imgElement);
});

test('mammoth.images.dataUri() encodes images in base64', () => {
  var imageBuffer = new Buffer('abc');
  var image = new documents.Image({
    readImage(encoding) {
      return promises.when(imageBuffer.toString(encoding));
    },
    contentType: 'image/jpeg',
  });

  return mammoth.images.dataUri(image).then((result) => {
    assertThat(
      result,
      contains(
        hasProperties({
          tag: hasProperties({
            attributes: { src: 'data:image/jpeg;base64,YWJj' },
          }),
        })
      )
    );
  });
});

test('mammoth.images.imgElement()', {
  'when element does not have alt text then alt attribute is not set'() {
    var imageBuffer = new Buffer('abc');
    var image = new documents.Image({
      readImage(encoding) {
        return promises.when(imageBuffer.toString(encoding));
      },
      contentType: 'image/jpeg',
    });

    var result = mammoth.images.imgElement((image) => ({ src: '<src>' }))(
      image
    );

    return result.then((result) => {
      assertThat(
        result,
        contains(
          hasProperties({
            tag: hasProperties({
              attributes: equalTo({ src: '<src>' }),
            }),
          })
        )
      );
    });
  },

  'when element has alt text then alt attribute is set'() {
    var imageBuffer = new Buffer('abc');
    var image = new documents.Image({
      readImage(encoding) {
        return promises.when(imageBuffer.toString(encoding));
      },
      contentType: 'image/jpeg',
      altText: '<alt>',
    });

    var result = mammoth.images.imgElement((image) => ({ src: '<src>' }))(
      image
    );

    return result.then((result) => {
      assertThat(
        result,
        contains(
          hasProperties({
            tag: hasProperties({
              attributes: equalTo({ alt: '<alt>', src: '<src>' }),
            }),
          })
        )
      );
    });
  },

  'image alt text can be overridden by alt attribute returned from function'() {
    var imageBuffer = new Buffer('abc');
    var image = new documents.Image({
      readImage(encoding) {
        return promises.when(imageBuffer.toString(encoding));
      },
      contentType: 'image/jpeg',
      altText: '<alt>',
    });

    var result = mammoth.images.imgElement((image) => ({
      alt: '<alt override>',
      src: '<src>',
    }))(image);

    return result.then((result) => {
      assertThat(
        result,
        contains(
          hasProperties({
            tag: hasProperties({
              attributes: equalTo({ alt: '<alt override>', src: '<src>' }),
            }),
          })
        )
      );
    });
  },
});
