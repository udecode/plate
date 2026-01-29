var path = require('path');

var root = path.dirname(__dirname);

module.exports = (testModule) => {
  var tests = (testModule.exports[path.relative(root, testModule.filename)] =
    {});
  return (name, func) => {
    tests[name] = func;
  };
};
