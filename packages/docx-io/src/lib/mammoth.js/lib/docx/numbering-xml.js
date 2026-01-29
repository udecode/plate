var _ = require('underscore');

exports.readNumberingXml = readNumberingXml;
exports.Numbering = Numbering;
exports.defaultNumbering = new Numbering(
  {},
  {},
  {
    findNumberingStyleById() {
      return null;
    },
  }
);

function Numbering(nums, abstractNums, styles) {
  var allLevels = _.flatten(
    _.values(abstractNums).map((abstractNum) => _.values(abstractNum.levels))
  );

  var levelsByParagraphStyleId = _.indexBy(
    allLevels.filter((level) => level.paragraphStyleId != null),
    'paragraphStyleId'
  );

  function findLevel(numId, level) {
    var num = nums[numId];
    if (num) {
      var abstractNum = abstractNums[num.abstractNumId];
      if (!abstractNum) {
        return null;
      }
      if (abstractNum.numStyleLink == null) {
        return abstractNums[num.abstractNumId].levels[level];
      }
      var style = styles.findNumberingStyleById(abstractNum.numStyleLink);
      return findLevel(style.numId, level);
    }
    return null;
  }

  function findLevelByParagraphStyleId(styleId) {
    return levelsByParagraphStyleId[styleId] || null;
  }

  return {
    findLevel,
    findLevelByParagraphStyleId,
  };
}

function readNumberingXml(root, options) {
  if (!options || !options.styles) {
    throw new Error('styles is missing');
  }

  var abstractNums = readAbstractNums(root);
  var nums = readNums(root, abstractNums);
  return new Numbering(nums, abstractNums, options.styles);
}

function readAbstractNums(root) {
  var abstractNums = {};
  root.getElementsByTagName('w:abstractNum').forEach((element) => {
    var id = element.attributes['w:abstractNumId'];
    abstractNums[id] = readAbstractNum(element);
  });
  return abstractNums;
}

function readAbstractNum(element) {
  var levels = {};

  // Some malformed documents define numbering levels without an index, and
  // reference the numbering using a w:numPr element without a w:ilvl child.
  // To handle such cases, we assume a level of 0 as a fallback.
  var levelWithoutIndex = null;

  element.getElementsByTagName('w:lvl').forEach((levelElement) => {
    var levelIndex = levelElement.attributes['w:ilvl'];
    var numFmt = levelElement.firstOrEmpty('w:numFmt').attributes['w:val'];
    var isOrdered = numFmt !== 'bullet';
    var paragraphStyleId =
      levelElement.firstOrEmpty('w:pStyle').attributes['w:val'];

    if (levelIndex === undefined) {
      levelWithoutIndex = {
        isOrdered,
        level: '0',
        paragraphStyleId,
      };
    } else {
      levels[levelIndex] = {
        isOrdered,
        level: levelIndex,
        paragraphStyleId,
      };
    }
  });

  if (
    levelWithoutIndex !== null &&
    levels[levelWithoutIndex.level] === undefined
  ) {
    levels[levelWithoutIndex.level] = levelWithoutIndex;
  }

  var numStyleLink = element.firstOrEmpty('w:numStyleLink').attributes['w:val'];

  return { levels, numStyleLink };
}

function readNums(root) {
  var nums = {};
  root.getElementsByTagName('w:num').forEach((element) => {
    var numId = element.attributes['w:numId'];
    var abstractNumId = element.first('w:abstractNumId').attributes['w:val'];
    nums[numId] = { abstractNumId };
  });
  return nums;
}
