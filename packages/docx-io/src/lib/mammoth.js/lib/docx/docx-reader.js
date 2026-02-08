exports.read = read;
exports._findPartPaths = findPartPaths;

var promises = require('../promises');
var documents = require('../documents');
var Result = require('../results').Result;
var zipfile = require('../zipfile');

var readXmlFromZipFile = require('./office-xml-reader').readXmlFromZipFile;
var createBodyReader = require('./body-reader').createBodyReader;
var DocumentXmlReader = require('./document-xml-reader').DocumentXmlReader;
var relationshipsReader = require('./relationships-reader');
var contentTypesReader = require('./content-types-reader');
var numberingXml = require('./numbering-xml');
var stylesReader = require('./styles-reader');
var notesReader = require('./notes-reader');
var commentsReader = require('./comments-reader');
var commentsExtendedReader = require('./comments-extended-reader');
var Files = require('./files').Files;

function read(docxFile, input, options) {
  input = input || {};
  options = options || {};

  var files = new Files({
    externalFileAccess: options.externalFileAccess,
    relativeToFile: input.path,
  });

  return promises
    .props({
      contentTypes: readContentTypesFromZipFile(docxFile),
      partPaths: findPartPaths(docxFile),
      docxFile,
      files,
    })
    .also((result) => ({
      styles: readStylesFromZipFile(docxFile, result.partPaths.styles),
    }))
    .also((result) => ({
      numbering: readNumberingFromZipFile(
        docxFile,
        result.partPaths.numbering,
        result.styles
      ),
    }))
    .also((result) => ({
      commentsExtended: readXmlFromZipFile(
        result.docxFile,
        result.partPaths.commentsExtended
      ).then((xml) => {
        if (xml) {
          return commentsExtendedReader.createCommentsExtendedReader()(xml);
        }
        return new Result({});
      }),
      // Read commentsIds.xml (paraId → durableId) and
      // commentsExtensible.xml (durableId → dateUtc) to build
      // a paraId → dateUtc map for correcting Word's fake-Z dates.
      dateUtcMap: promises
        .props({
          idsXml: readXmlFromZipFile(
            result.docxFile,
            result.partPaths.commentsIds || 'word/commentsIds.xml'
          ),
          extXml: readXmlFromZipFile(
            result.docxFile,
            result.partPaths.commentsExtensible || 'word/commentsExtensible.xml'
          ),
        })
        .then((r) => {
          var paraIdToDurable = {};
          if (r.idsXml) {
            r.idsXml.children.forEach((child) => {
              if (child.name === 'w16cid:commentId') {
                var pid = child.attributes['w16cid:paraId'];
                var did = child.attributes['w16cid:durableId'];
                if (pid && did) paraIdToDurable[pid] = did;
              }
            });
          }
          var durableToDateUtc = {};
          if (r.extXml) {
            r.extXml.children.forEach((child) => {
              if (child.name === 'w16cex:commentExtensible') {
                var did = child.attributes['w16cex:durableId'];
                var utc = child.attributes['w16cex:dateUtc'];
                if (did && utc) durableToDateUtc[did] = utc;
              }
            });
          }
          // Combine: paraId → durableId → dateUtc
          var map = {};
          Object.keys(paraIdToDurable).forEach((pid) => {
            var did = paraIdToDurable[pid];
            if (durableToDateUtc[did]) {
              map[pid] = durableToDateUtc[did];
            }
          });
          return new Result(map);
        }),
    }))
    .also((result) => ({
      footnotes: readXmlFileWithBody(
        result.partPaths.footnotes,
        result,
        (bodyReader, xml) => {
          if (xml) {
            return notesReader.createFootnotesReader(bodyReader)(xml);
          }
          return new Result([]);
        }
      ),
      endnotes: readXmlFileWithBody(
        result.partPaths.endnotes,
        result,
        (bodyReader, xml) => {
          if (xml) {
            return notesReader.createEndnotesReader(bodyReader)(xml);
          }
          return new Result([]);
        }
      ),
      comments: readXmlFileWithBody(
        result.partPaths.comments,
        result,
        (bodyReader, xml) => {
          if (xml) {
            return commentsReader.createCommentsReader(
              bodyReader,
              result.commentsExtended.value || {},
              result.dateUtcMap.value || {}
            )(xml);
          }
          return new Result([]);
        }
      ),
    }))
    .also((result) => ({
      notes: result.footnotes.flatMap((footnotes) =>
        result.endnotes.map(
          (endnotes) => new documents.Notes(footnotes.concat(endnotes))
        )
      ),
    }))
    .then((result) =>
      readXmlFileWithBody(
        result.partPaths.mainDocument,
        result,
        (bodyReader, xml) =>
          result.notes.flatMap((notes) =>
            result.comments.flatMap((comments) => {
              var reader = new DocumentXmlReader({
                bodyReader,
                notes,
                comments,
              });
              return reader.convertXmlToDocument(xml);
            })
          )
      )
    );
}

function findPartPaths(docxFile) {
  return readPackageRelationships(docxFile).then((packageRelationships) => {
    var mainDocumentPath = findPartPath({
      docxFile,
      relationships: packageRelationships,
      relationshipType:
        'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
      basePath: '',
      fallbackPath: 'word/document.xml',
    });

    if (!docxFile.exists(mainDocumentPath)) {
      throw new Error(
        'Could not find main document part. Are you sure this is a valid .docx file?'
      );
    }

    return xmlFileReader({
      filename: relationshipsFilename(mainDocumentPath),
      readElement: relationshipsReader.readRelationships,
      defaultValue: relationshipsReader.defaultValue,
    })(docxFile).then((documentRelationships) => {
      function findPartRelatedToMainDocument(name) {
        return findPartPath({
          docxFile,
          relationships: documentRelationships,
          relationshipType:
            'http://schemas.openxmlformats.org/officeDocument/2006/relationships/' +
            name,
          basePath: zipfile.splitPath(mainDocumentPath).dirname,
          fallbackPath: 'word/' + name + '.xml',
        });
      }

      return {
        mainDocument: mainDocumentPath,
        comments: findPartRelatedToMainDocument('comments'),
        commentsExtended: findPartPath({
          docxFile,
          relationships: documentRelationships,
          relationshipType:
            'http://schemas.microsoft.com/office/2011/relationships/commentsExtended',
          basePath: zipfile.splitPath(mainDocumentPath).dirname,
          fallbackPath: 'word/commentsExtended.xml',
        }),
        endnotes: findPartRelatedToMainDocument('endnotes'),
        footnotes: findPartRelatedToMainDocument('footnotes'),
        numbering: findPartRelatedToMainDocument('numbering'),
        styles: findPartRelatedToMainDocument('styles'),
      };
    });
  });
}

function findPartPath(options) {
  var docxFile = options.docxFile;
  var relationships = options.relationships;
  var relationshipType = options.relationshipType;
  var basePath = options.basePath;
  var fallbackPath = options.fallbackPath;

  var targets = relationships.findTargetsByType(relationshipType);
  var normalisedTargets = targets.map((target) =>
    stripPrefix(zipfile.joinPath(basePath, target), '/')
  );
  var validTargets = normalisedTargets.filter((target) =>
    docxFile.exists(target)
  );
  if (validTargets.length === 0) {
    return fallbackPath;
  }
  return validTargets[0];
}

function stripPrefix(value, prefix) {
  if (value.substring(0, prefix.length) === prefix) {
    return value.substring(prefix.length);
  }
  return value;
}

function xmlFileReader(options) {
  return (zipFile) =>
    readXmlFromZipFile(zipFile, options.filename).then((element) =>
      element ? options.readElement(element) : options.defaultValue
    );
}

function readXmlFileWithBody(filename, options, func) {
  var readRelationshipsFromZipFile = xmlFileReader({
    filename: relationshipsFilename(filename),
    readElement: relationshipsReader.readRelationships,
    defaultValue: relationshipsReader.defaultValue,
  });

  return readRelationshipsFromZipFile(options.docxFile).then(
    (relationships) => {
      var bodyReader = new createBodyReader({
        relationships,
        contentTypes: options.contentTypes,
        docxFile: options.docxFile,
        numbering: options.numbering,
        styles: options.styles,
        files: options.files,
      });
      return readXmlFromZipFile(options.docxFile, filename).then((xml) =>
        func(bodyReader, xml)
      );
    }
  );
}

function relationshipsFilename(filename) {
  var split = zipfile.splitPath(filename);
  return zipfile.joinPath(split.dirname, '_rels', split.basename + '.rels');
}

var readContentTypesFromZipFile = xmlFileReader({
  filename: '[Content_Types].xml',
  readElement: contentTypesReader.readContentTypesFromXml,
  defaultValue: contentTypesReader.defaultContentTypes,
});

function readNumberingFromZipFile(zipFile, path, styles) {
  return xmlFileReader({
    filename: path,
    readElement(element) {
      return numberingXml.readNumberingXml(element, { styles });
    },
    defaultValue: numberingXml.defaultNumbering,
  })(zipFile);
}

function readStylesFromZipFile(zipFile, path) {
  return xmlFileReader({
    filename: path,
    readElement: stylesReader.readStylesXml,
    defaultValue: stylesReader.defaultStyles,
  })(zipFile);
}

var readPackageRelationships = xmlFileReader({
  filename: '_rels/.rels',
  readElement: relationshipsReader.readRelationships,
  defaultValue: relationshipsReader.defaultValue,
});
