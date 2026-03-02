var documents = require('../documents');
var Result = require('../results').Result;

function createCommentsReader(bodyReader, commentsExtended, dateUtcMap) {
  commentsExtended = commentsExtended || {};
  dateUtcMap = dateUtcMap || {};

  function readCommentsXml(element) {
    return Result.combine(
      element.getElementsByTagName('w:comment').map(readCommentElement)
    );
  }

  function readCommentElement(element) {
    var id = element.attributes['w:id'];

    function readOptionalAttribute(name) {
      return (element.attributes[name] || '').trim() || null;
    }

    return bodyReader.readXmlElements(element.children).map((body) => {
      var paraId = null;
      if (body) {
        for (var i = 0; i < body.length; i++) {
          if (body[i].paraId) {
            paraId = body[i].paraId;
            break;
          }
        }
      }
      var parentParaId = paraId ? commentsExtended[paraId] : null;

      // Prefer dateUtc (real UTC from commentsExtensible.xml) over
      // w:date (local time with fake Z, Word convention)
      var dateFromXml = readOptionalAttribute('w:date');
      var resolvedDate = (paraId && dateUtcMap[paraId]) || dateFromXml;

      return documents.comment({
        commentId: id,
        body,
        authorName: readOptionalAttribute('w:author'),
        authorInitials: readOptionalAttribute('w:initials'),
        date: resolvedDate,
        paraId,
        parentParaId,
      });
    });
  }

  return readCommentsXml;
}

exports.createCommentsReader = createCommentsReader;
