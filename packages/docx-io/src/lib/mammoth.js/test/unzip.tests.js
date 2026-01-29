var fs = require('fs');
var assert = require('assert');
var path = require('path');

var test = require('./test')(module);
var unzip = require('../lib/unzip');
var promises = require('../lib/promises');

test('unzip fails if given empty object', () =>
  unzip.openZip({}).then(
    () => {
      assert.ok(false, 'Expected failure');
    },
    (error) => {
      assert.equal('Could not find file in options', error.message);
    }
  ));

test('unzip can open local zip file', () => {
  var zipPath = path.join(__dirname, 'test-data/hello.zip');
  return unzip
    .openZip({ path: zipPath })
    .then((zipFile) => zipFile.read('hello', 'utf8'))
    .then((contents) => {
      assert.equal(contents, 'Hello world\n');
    });
});

test('unzip can open Buffer', () => {
  var zipPath = path.join(__dirname, 'test-data/hello.zip');
  return promises
    .nfcall(fs.readFile, zipPath)
    .then((buffer) => unzip.openZip({ buffer }))
    .then((zipFile) => zipFile.read('hello', 'utf8'))
    .then((contents) => {
      assert.equal(contents, 'Hello world\n');
    });
});
