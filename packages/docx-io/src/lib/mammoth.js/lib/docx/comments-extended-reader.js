var documents = require('../documents');
var Result = require('../results').Result;

function createCommentsExtendedReader(bodyReader) {
  function readCommentsExtendedXml(element) {
    var mappings = {};
    element.children.forEach((child) => {
      if (child.name === 'w15:commentEx') {
        var paraId = child.attributes['w15:paraId'];
        var parentParaId = child.attributes['w15:paraIdParent'];
        var done = child.attributes['w15:done'];
        if (paraId && parentParaId) {
          mappings[paraId] = parentParaId;
        }
      }
    });
    return new Result(mappings);
  }

  return readCommentsExtendedXml;
}

exports.createCommentsExtendedReader = createCommentsExtendedReader;
