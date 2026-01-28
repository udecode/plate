// for compiling docx-validator.js into a web worker bundle
const path = require('path');

module.exports = {
  entry: './docx-validator.js',
  output: {
    filename: 'docx-validator.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'DocxValidator',
    libraryTarget: 'var'
  },
  mode: 'production',
  target: 'webworker'
};