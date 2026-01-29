export const extractListLevelStyles = (cssText, listId, level, numId) => {
  const pattern = new RegExp(`@list\\s+l${listId}:level${level}(?:\\s+lfo${numId})?\\s*\\{([^}]+)\\}`, 'i');
  const match = cssText.match(pattern);
  if (!match) return null;

  const rawStyles = match[1]
    .split(';')
    .map((line) => line.trim())
    .filter(Boolean);

  const styleMap = {};
  for (const style of rawStyles) {
    const [key, value] = style.split(':').map((s) => s.trim());
    styleMap[key] = value;
  }

  return styleMap;
};

export const numDefMap = new Map([
  ['decimal', 'decimal'],
  ['alpha-lower', 'lowerLetter'],
  ['alpha-upper', 'upperLetter'],
  ['roman-lower', 'lowerRoman'],
  ['roman-upper', 'upperRoman'],
  ['bullet', 'bullet'],
]);

export const numDefByTypeMap = new Map([
  ['1', 'decimal'],
  ['a', 'lowerLetter'],
  ['A', 'upperLetter'],
  ['I', 'upperRoman'],
  ['i', 'lowerRoman'],
]);

function getStartNumber(lvlText) {
  const match = lvlText.match(/^(\d+)/);
  if (match) return parseInt(match[1], 10);
  return null;
}

function letterToNumber(letter) {
  return letter.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0) + 1;
}

function getStartNumberFromAlpha(lvlText) {
  const match = lvlText.match(/^([a-zA-Z])/);
  if (match) return letterToNumber(match[1]);
  return null;
}

function romanToNumber(roman) {
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let num = 0,
    prev = 0;
  for (let i = roman.length - 1; i >= 0; i--) {
    const curr = map[roman[i].toUpperCase()] || 0;
    if (curr < prev) num -= curr;
    else num += curr;
    prev = curr;
  }
  return num;
}

function getStartNumberFromRoman(lvlText) {
  const match = lvlText.match(/^([ivxlcdmIVXLCDM]+)/);
  if (match) return romanToNumber(match[1]);
  return null;
}

export const startHelperMap = new Map([
  ['decimal', getStartNumber],
  ['lowerLetter', getStartNumberFromAlpha],
  ['upperLetter', getStartNumberFromAlpha],
  ['lowerRoman', getStartNumberFromRoman],
  ['upperRoman', getStartNumberFromRoman],
  ['bullet', () => 1],
]);

export const googleNumDefMap = new Map([
  ['decimal', 'decimal'],
  ['decimal-leading-zero', 'decimal'],
  ['lower-alpha', 'lowerLetter'],
  ['upper-alpha', 'upperLetter'],
  ['lower-roman', 'lowerRoman'],
  ['upper-roman', 'upperRoman'],
  ['bullet', 'bullet'],
]);

export const getLvlTextForGoogleList = (fmt, level, editor) => {
  const bulletListDef = editor.converter.numbering.abstracts[0];
  const bulletDefForLevel = bulletListDef.elements.find(
    (el) => el.name === 'w:lvl' && el.attributes?.['w:ilvl'] === (level - 1).toString(),
  );
  const bulletLvlText = bulletDefForLevel.elements.find((el) => el.name === 'w:lvlText')?.attributes?.['w:val'];

  switch (fmt) {
    case 'decimal-leading-zero':
      return `0%${level}.`;
    case 'bullet':
      return bulletLvlText;
    default:
      return `%${level}.`;
  }
};
