var documents = require('../documents');
var Result = require('../results').Result;

function createCommentsReader(bodyReader, commentsExtended) {
  commentsExtended = commentsExtended || {};

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
          console.log('[DOCX DEBUG] comment ' + id + ' body[' + i + '] type:', body[i].type, 'paraId:', body[i].paraId);
          if (body[i].paraId) {
            paraId = body[i].paraId;
            break;
          }
        }
      }
      var parentParaId = paraId ? commentsExtended[paraId] : null;
      console.log('[DOCX DEBUG] comment ' + id + ': paraId=' + paraId + ' parentParaId=' + parentParaId + ' commentsExtended keys:', Object.keys(commentsExtended));

      return documents.comment({
        commentId: id,
        body,
        authorName: readOptionalAttribute('w:author'),
        authorInitials: readOptionalAttribute('w:initials'),
        date: readOptionalAttribute('w:date'),
        paraId,
        parentParaId,
      });
    });
  }

  return readCommentsXml;
}

exports.createCommentsReader = createCommentsReader;
