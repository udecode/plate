var base64js = require('base64-js');
var JSZip = require('jszip');

exports.openArrayBuffer = openArrayBuffer;
exports.splitPath = splitPath;
exports.joinPath = joinPath;

function openArrayBuffer(arrayBuffer) {
  return JSZip.loadAsync(arrayBuffer).then((zipFile) => {
    function exists(name) {
      return zipFile.file(name) !== null;
    }

    function read(name, encoding) {
      var file = zipFile.file(name);
      if (file === null) {
        return Promise.reject(new Error('File not found in ZIP: ' + name));
      }
      return file.async('uint8array').then((array) => {
        if (encoding === 'base64') {
          return base64js.fromByteArray(array);
        }
        if (encoding) {
          var decoder = new TextDecoder(encoding);
          return decoder.decode(array);
        }
        return array;
      });
    }

    function write(name, contents) {
      zipFile.file(name, contents);
    }

    function toArrayBuffer() {
      return zipFile.generateAsync({ type: 'arraybuffer' });
    }

    return {
      exists,
      read,
      write,
      toArrayBuffer,
    };
  });
}

function splitPath(path) {
  var lastIndex = path.lastIndexOf('/');
  if (lastIndex === -1) {
    return { dirname: '', basename: path };
  }
  return {
    dirname: path.substring(0, lastIndex),
    basename: path.substring(lastIndex + 1),
  };
}

function joinPath() {
  var nonEmptyPaths = Array.prototype.filter.call(arguments, (path) => path);

  var relevantPaths = [];

  nonEmptyPaths.forEach((path) => {
    if (path.startsWith('/')) {
      relevantPaths = [path];
    } else {
      relevantPaths.push(path);
    }
  });

  return relevantPaths.join('/');
}
