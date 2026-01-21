var _ = require('underscore');

var docxReader = require('./docx/docx-reader');
var docxStyleMap = require('./docx/style-map');
var DocumentConverter = require('./document-to-html').DocumentConverter;
var convertElementToRawText = require('./raw-text').convertElementToRawText;
var readStyle = require('./style-reader').readStyle;
var readOptions = require('./options-reader').readOptions;
var unzip = require('./unzip');
var Result = require('./results').Result;

exports.convertToHtml = convertToHtml;
exports.convertToMarkdown = convertToMarkdown;
exports.convert = convert;
exports.extractRawText = extractRawText;
exports.images = require('./images');
exports.transforms = require('./transforms');
exports.underline = require('./underline');
exports.embedStyleMap = embedStyleMap;
exports.readEmbeddedStyleMap = readEmbeddedStyleMap;

function convertToHtml(input, options) {
  return convert(input, options);
}

function convertToMarkdown(input, options) {
  var markdownOptions = Object.create(options || {});
  markdownOptions.outputFormat = 'markdown';
  return convert(input, markdownOptions);
}

function convert(input, options) {
  options = readOptions(options);

  return unzip
    .openZip(input)
    .tap((docxFile) =>
      docxStyleMap.readStyleMap(docxFile).then((styleMap) => {
        options.embeddedStyleMap = styleMap;
      })
    )
    .then((docxFile) =>
      docxReader
        .read(docxFile, input, options)
        .then((documentResult) => documentResult.map(options.transformDocument))
        .then((documentResult) =>
          convertDocumentToHtml(documentResult, options)
        )
    );
}

function readEmbeddedStyleMap(input) {
  return unzip.openZip(input).then(docxStyleMap.readStyleMap);
}

function convertDocumentToHtml(documentResult, options) {
  var styleMapResult = parseStyleMap(options.readStyleMap());
  var parsedOptions = _.extend({}, options, {
    styleMap: styleMapResult.value,
  });
  var documentConverter = new DocumentConverter(parsedOptions);

  return documentResult.flatMapThen((document) =>
    styleMapResult.flatMapThen((styleMap) =>
      documentConverter.convertToHtml(document)
    )
  );
}

function parseStyleMap(styleMap) {
  return Result.combine((styleMap || []).map(readStyle)).map((styleMap) =>
    styleMap.filter((styleMapping) => !!styleMapping)
  );
}

function extractRawText(input) {
  return unzip
    .openZip(input)
    .then(docxReader.read)
    .then((documentResult) => documentResult.map(convertElementToRawText));
}

function embedStyleMap(input, styleMap) {
  return unzip
    .openZip(input)
    .tap((docxFile) => docxStyleMap.writeStyleMap(docxFile, styleMap))
    .then((docxFile) => docxFile.toArrayBuffer())
    .then((arrayBuffer) => ({
      toArrayBuffer() {
        return arrayBuffer;
      },
      toBuffer() {
        return Buffer.from(arrayBuffer);
      },
    }));
}

exports.styleMapping = () => {
  throw new Error(
    'Use a raw string instead of mammoth.styleMapping e.g. "p[style-name=\'Title\'] => h1" instead of mammoth.styleMapping("p[style-name=\'Title\'] => h1")'
  );
};
