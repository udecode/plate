import { carbonCopy } from '../../../utilities/carbonCopy.js';
import { twipsToPixels } from '../../helpers.js';

/**
 * @type {import("docxImporter").NodeHandler}
 */
export const handleListNode = (params) => {
  const { nodes, docx } = params;
  if (nodes.length === 0 || nodes[0].name !== 'w:p' || nodes[0].isList) {
    return { nodes: [], consumed: 0 };
  }

  // Check if this paragraph node is a list
  const node = carbonCopy(nodes[0]);

  const isList = testForList(node, docx);
  if (isList) {
    node.isList = true;
    const result = handleListNodes(params, node);
    return {
      nodes: [result],
      consumed: 1,
    };
  } else {
    return { nodes: [], consumed: 0 };
  }
};

/**
 * @type {import("docxImporter").NodeHandlerEntry}
 */
export const listHandlerEntity = {
  handlerName: 'listHandler',
  handler: handleListNode,
};

/**
 * List processing
 *
 * This recursive function takes a list of known list items and combines them into nested lists.
 *
 * It begins with listLevel = 0, and if we find an indented node, we call this function again and increase the level.
 * with the same set of list items (as we do not know the node levels until we process them).
 *
 * @param {Array} listItems - Array of list items to process.
 * @param {ParsedDocx} docx - The parsed docx object.
 * @param {NodeListHandler} nodeListHandler - The node list handler function.
 * @param {boolean} insideTrackChange - Whether we are inside a track change.
 * @param {number} [listLevel=0] - The current indentation level of the list.
 * @returns {Object} The processed list node with structured content.
 */
function handleListNodes(params, node) {
  const { docx, nodeListHandler, lists } = params;

  // List numId can come from inline props or styled def
  const initialpPr = node.elements.find((el) => el.name === 'w:pPr');
  const styleTag = initialpPr?.elements?.find((el) => el.name === 'w:pStyle');
  const styleId = styleTag?.attributes['w:val'];
  const { numPr: numPrTag, type: numPrType } = getNumPrRecursive({ node, styleId, docx });

  const currentListNumId = getNumIdFromTag(numPrTag);
  const iLvlTag = numPrTag?.elements?.find((el) => el.name === 'w:ilvl');
  let iLvl = Number(iLvlTag?.attributes['w:val']);

  // If no iLvl, try an outline level
  if (!iLvl && iLvl !== 0) iLvl = getOutlineLevelFromStyleTag(styleId, docx);

  let numberingDefinition = getNodeNumberingDefinition(node, iLvl, docx);
  if (!Object.keys(numberingDefinition).length) {
    const { definition, ilvl } = getNodeNumberingDefinitionByStyle(node, docx);
    if (definition) numberingDefinition = definition;
    if (Number.isNaN(iLvl)) iLvl = ilvl;
  }

  const { listType, listOrderingType, listpPrs, start, lvlText, customFormat } = numberingDefinition;

  // Fallback if the list definition is not found or is invalid
  // See invalid-list-def-fallback.docx for example and
  if (!listType) {
    const pPrIndex = node.elements.findIndex((el) => el.name === 'w:pPr');
    const pPr = node.elements[pPrIndex];
    const numPrIndex = pPr?.elements?.findIndex((el) => el.name === 'w:numPr');
    if (numPrIndex >= 0) {
      pPr?.elements?.splice(numPrIndex, 1);
      node.elements[pPrIndex] = pPr;
    }

    const styleIdIndex = pPr?.elements?.findIndex((el) => el.name === 'w:pStyle');
    if (styleIdIndex >= 0) pPr?.elements?.splice(styleIdIndex, 1);

    const fallBack = nodeListHandler.handler({ ...params, nodes: [node] })?.filter((n) => n);
    return fallBack[0];
  }

  if (!lists[currentListNumId]) lists[currentListNumId] = { levels: {} };
  const currentListByNumId = lists[currentListNumId];

  if (!currentListByNumId.levels[iLvl]) currentListByNumId.levels[iLvl] = Number(start) || 1;
  else currentListByNumId.levels[iLvl]++;

  // Reset deeper levels when this level is updated
  Object.keys(currentListByNumId.levels).forEach((key) => {
    const level = Number(key);
    if (level > iLvl) {
      delete currentListByNumId.levels[level];
    }
  });

  const path = generateListPath(iLvl, currentListNumId, styleId, currentListByNumId.levels, docx);
  if (!path.length) path.push(currentListByNumId.levels[iLvl]);

  // Prepare list item attrs
  const attrs = {};
  attrs.lvlText = lvlText;
  attrs.listLevel = path;
  attrs.listNumberingType = listOrderingType;
  attrs.numId = currentListNumId;
  attrs.level = iLvl;
  attrs.numPrType = numPrType;
  attrs.styleId = styleId;
  attrs.customFormat = customFormat;

  // Get the contents of the node
  node.isList = true;

  const nodePpr = node.attrs?.paragraphProperties?.elements?.find((el) => el.name === 'w:pPr');
  const numPrIndex = node.attrs?.paragraphProperties?.elements?.findIndex((el) => el.name === 'w:numPr');
  nodePpr?.elements?.splice(numPrIndex, 1);

  const listContents = nodeListHandler.handler({ ...params, nodes: [node] });
  const innerParagraph = listContents.find((el) => el.type === 'paragraph');
  const firstElement = innerParagraph.content[0];

  // eslint-disable-next-line no-unused-vars
  const textStyle = firstElement?.marks?.find((mark) => mark.type === 'textStyle');

  attrs.indent = listpPrs?.indent;

  const processedContents = listContents.map((el, index) => {
    const { attrs: elementAttrs } = el;

    // eslint-disable-next-line no-unused-vars
    const { indent, textIndent, paragraphProperties, ...rest } = elementAttrs;

    // Take indent from the first paragraph if its not defined
    if (index === 0 && !attrs.indent) attrs.indent = indent;

    return {
      ...el,
      attrs: rest,
    };
  });

  // Generate the list item
  const listItem = {
    type: 'listItem',
    content: processedContents || [],
    attrs,
  };

  // Generate the list node
  const resultingList = {
    type: listType,
    content: [listItem],
    attrs: {
      'list-style-type': listOrderingType,
      listId: currentListNumId,
    },
  };

  return resultingList;
}

const getOutlineLevelFromStyleTag = (styleTag, docx) => {
  const matchedStyle = getStyleTagFromStyleId(styleTag, docx);
  const pPr = matchedStyle?.elements?.find((style) => style.name === 'w:pPr');
  const outlineLevel = pPr?.elements?.find((style) => style.name === 'w:outlineLvl');

  try {
    return parseInt(outlineLevel?.attributes['w:val']);
  } catch {}
};

/**
 * Checks if the given node is a list or not.
 *
 * @param {XmlNode} node The node to check.
 * @returns {boolean} Whether the node is a list or not.
 */
export function testForList(node, docx) {
  const { elements } = node;
  const pPr = elements?.find((el) => el.name === 'w:pPr');
  if (!pPr) return false;

  const paragraphStyle = pPr.elements?.find((el) => el.name === 'w:pStyle');
  let numPr = pPr.elements?.find((el) => el.name === 'w:numPr');
  let numId = getNumIdFromTag(numPr);
  const ilvlTag = numPr?.elements?.find((el) => el.name === 'w:ilvl');
  let ilvl = ilvlTag?.attributes['w:val'];
  let outlinelvl;

  const styleId = paragraphStyle?.attributes['w:val'];

  const styleTag = getStyleTagFromStyleId(styleId, docx);
  if (styleTag && !numId) {
    const { numPr: numPrRecursve } = getNumPrRecursive({ node, styleId, docx });
    numPr = numPrRecursve;
    numId = getNumIdFromTag(numPr);

    const stylePpr = styleTag?.elements?.find((el) => el.name === 'w:pPr');
    ilvl = stylePpr?.elements?.find((el) => el.name === 'w:ilvl')?.attributes['w:val'];
    outlinelvl = stylePpr?.elements?.find((el) => el.name === 'w:outlineLvl')?.attributes['w:val'];
    ilvl = outlinelvl || ilvl;
  }

  const abstractNumDefinition = getAbstractDefinition(numId, docx);
  const levelDefinition = abstractNumDefinition?.elements?.find(
    (el) => el.name === 'w:lvl' && el.attributes?.['w:ilvl'] == ilvl,
  );

  if (numId && !levelDefinition && abstractNumDefinition) {
    return true;
  }

  if (!levelDefinition) return false;

  return !!numId;
}

const getNumIdFromTag = (tag) => {
  return tag?.elements?.find((el) => el.name === 'w:numId')?.attributes['w:val'];
};

/**
 * Get the style tag from the style ID
 *
 * @param {string} styleId The style ID to search for
 * @param {Object} docx The docx data
 * @returns {Object} The style tag
 */
export function getStyleTagFromStyleId(styleId, docx) {
  const styles = docx['word/styles.xml'];
  if (!styles) return {};

  const styleEls = styles.elements;
  const wStyles = styleEls.find((el) => el.name === 'w:styles');
  const styleTags = wStyles.elements.filter((style) => style.name === 'w:style');
  const styleDef = styleTags.find((tag) => tag.attributes['w:styleId'] === styleId);
  return styleDef;
}

/**
 * Get the num ID from the style definition
 * This is a recursive function that will check the style definition for the numId
 * If it doesn't exist, it will check the basedOn style definition for the numId
 * This will continue until we find a numId or we run out of basedOn styles
 *
 * @param {Object} node The node to check
 * @param {string} styleId The style ID to check
 * @param {Object} docx The docx data
 * @param {Set} seenStyleIds The set of style IDs we've already seen to avoid circular references
 * @returns {string|null} The numId or null if not found
 */
export function getNumPrRecursive({ node, styleId, docx, seenStyleIds = new Set() }) {
  const initialPpr = node?.elements?.find((el) => el.name === 'w:pPr');
  const initialNumPr = initialPpr?.elements?.find((el) => el.name === 'w:numPr');
  let numPr = initialNumPr;
  let numId = getNumIdFromTag(numPr);
  if (numId) return { numPr, type: 'inline' };

  const matchedStyle = getStyleTagFromStyleId(styleId, docx);
  const pPr = matchedStyle?.elements?.find((style) => style.name === 'w:pPr');

  numPr = pPr?.elements?.find((style) => style.name === 'w:numPr');
  numId = getNumIdFromTag(numPr);
  const basedOn = matchedStyle?.elements?.find((style) => style.name === 'w:basedOn');

  if (!numId && !seenStyleIds.has(styleId)) {
    const basedOnStyleId = basedOn?.attributes['w:val'];
    seenStyleIds.add(styleId);
    if (!basedOnStyleId) return {};
    return getNumPrRecursive({ styleId: basedOnStyleId, docx, seenStyleIds });
  }

  return { numPr, type: 'numbering' };
}

const orderedListTypes = [
  'decimal', // eg: 1, 2, 3, 4, 5, ...
  'decimalZero', // eg: 01, 02, 03, 04, 05, ...
  'lowerRoman', // eg: i, ii, iii, iv, v, ...
  'upperRoman', // eg: I, II, III, IV, V, ...
  'lowerLetter', // eg: a, b, c, d, e, ...
  'upperLetter', // eg: A, B, C, D, E, ...
  'ordinal', // eg: 1st, 2nd, 3rd, 4th, 5th, ...
  'cardinalText', // eg: one, two, three, four, five, ...
  'ordinalText', // eg: first, second, third, fourth, fifth, ...
  'hex', // eg: 0, 1, 2, ..., 9, A, B, C, ..., F, 10, 11, ...
  'chicago', // eg: (0, 1, 2, ..., 9, 10, 11, 12, ..., 19, 1A, 1B, 1C, ..., 1Z, 20, 21, ..., 2Z)
  'none', // No bullet
];

const unorderedListTypes = [
  'bullet', // A standard bullet point (•)
  'square', // Square bullets (▪)
  'circle', // Circle bullets (◦)
  'disc', // Disc bullets (●)
];

const getListNumIdFromStyleRef = (styleId, docx) => {
  const styles = docx['word/styles.xml'];
  if (!styles) return null;

  const { elements } = styles;
  const styleTags = elements[0].elements.filter((style) => style.name === 'w:style');
  const style = styleTags.find((tag) => tag.attributes['w:styleId'] === styleId) || {};
  const pPr = style?.elements?.find((style) => style.name === 'w:pPr');
  if (!pPr) return null;

  let numPr = pPr?.elements?.find((style) => style.name === 'w:numPr');
  if (!numPr) return null;

  let numIdTag = numPr?.elements?.find((style) => style.name === 'w:numId') || {};
  let numId = getNumIdFromTag(numPr);
  let ilvlTag = numPr?.elements?.find((style) => style.name === 'w:ilvl');
  let ilvl = ilvlTag?.attributes?.['w:val'];

  const basedOnTag = style?.elements?.find((style) => style.name === 'w:basedOn');
  const basedOnId = basedOnTag?.attributes?.['w:val'];

  // If we don't have a numId, then we need to check the basedOn style
  // Which can in turn be based on some other style and so on.
  let loopCount = 0;
  while (numPr && !numId && loopCount < 10) {
    const basedOnStyle = styleTags.find((tag) => tag.attributes['w:styleId'] === basedOnId) || {};
    const basedOnPPr = basedOnStyle?.elements?.find((style) => style.name === 'w:pPr');
    numPr = basedOnPPr?.elements?.find((style) => style.name === 'w:numPr');
    numIdTag = numPr?.elements?.find((style) => style.name === 'w:numId') || {};
    numId = numIdTag?.attributes?.['w:val'];

    if (!ilvlTag) {
      ilvlTag = numPr?.elements?.find((style) => style.name === 'w:ilvl');
      ilvl = ilvlTag?.attributes?.['w:val'];
    }

    loopCount++;
  }

  return { numId, ilvl };
};

export const getAbstractDefinition = (numId, docx) => {
  const def = docx['word/numbering.xml'];
  if (!def) return {};

  const { elements } = def;
  const listData = elements[0];

  const numberingElements = listData.elements;
  const abstractDefinitions = numberingElements?.filter((style) => style.name === 'w:abstractNum');
  const numDefinitions = numberingElements?.filter((style) => style.name === 'w:num');
  const numDefinition = numDefinitions?.find((style) => style.attributes['w:numId'] == numId);

  const abstractNumId = numDefinition?.elements[0].attributes['w:val'];
  let listDefinitionForThisNumId = abstractDefinitions?.find(
    (style) => style.attributes['w:abstractNumId'] === abstractNumId,
  );

  const templateIdTag = listDefinitionForThisNumId?.elements?.find((el) => el.name === 'w:tmpl');
  const templateId = templateIdTag?.attributes?.['w:val'];
  if (templateId) {
    listDefinitionForThisNumId = numberingElements?.find((el) => {
      if (el.name !== 'w:abstractNum') return false;
      const tmpl = el.elements?.find((el) => el.name === 'w:tmpl');
      if (!tmpl) return false;

      const hasLevels = el.elements?.some((el) => el.name === 'w:lvl');
      const tmplId = tmpl.attributes?.['w:val'];
      return tmplId && hasLevels && tmplId === templateId;
    });
  }

  return listDefinitionForThisNumId;
};

export const generateListPath = (level, numId, styleId, levels, docx) => {
  const iLvl = Number(level);
  const path = [];
  if (iLvl > 0) {
    for (let i = iLvl; i >= 0; i--) {
      const { start: lvlStart } = getListLevelDefinitionTag(numId, i, styleId, docx);
      if (!levels[i]) levels[i] = Number(lvlStart) || 1;
      path.unshift(levels[i]);
    }
  }
  return path;
};

/**
 * Helper to get the list level definition tag for a specific list level
 * @param {string} numId The numId of the list
 * @param {string} level The level of the list
 * @param {Object} docx The docx data
 * @returns {Object} The list level definition tag start, numFmt, lvlText and lvlJc
 */
export const getListLevelDefinitionTag = (numId, level, pStyleId, docx) => {
  if (pStyleId) {
    const { numId: numIdFromStyles, ilvl: iLvlFromStyles } = getListNumIdFromStyleRef(pStyleId, docx) || {};
    if (!numId && numIdFromStyles) numId = numIdFromStyles;
    if (!level && iLvlFromStyles) level = iLvlFromStyles ? parseInt(iLvlFromStyles) : null;
  }

  const listDefinitionForThisNumId = getAbstractDefinition(numId, docx);
  const currentLevel = getDefinitionForLevel(listDefinitionForThisNumId, level);

  const numStyleLink = listDefinitionForThisNumId?.elements?.find((style) => style.name === 'w:numStyleLink');
  const numStyleLinkId = numStyleLink?.attributes['w:val'];
  if (numStyleLinkId) {
    const current = getListNumIdFromStyleRef(numStyleLinkId, docx);
    return getListLevelDefinitionTag(current.numId, level, null, docx);
  }

  const start = currentLevel?.elements?.find((style) => style.name === 'w:start')?.attributes['w:val'];
  let numFmtTag = currentLevel?.elements?.find((style) => style.name === 'w:numFmt');
  let numFmt = numFmtTag?.attributes['w:val'];

  if (!numFmt) {
    const altChoice = currentLevel?.elements.find((style) => style.name === 'mc:AlternateContent');
    const choice = altChoice?.elements.find((style) => style.name === 'mc:Choice');
    const choiceNumFmtTag = choice?.elements.find((style) => style.name === 'w:numFmt');
    const choiceNumFmt = choiceNumFmtTag?.attributes['w:val'];
    if (choiceNumFmt) {
      numFmtTag = choiceNumFmtTag;
      numFmt = choiceNumFmt;
    }
  }

  let lvlText = currentLevel?.elements?.find((style) => style.name === 'w:lvlText').attributes['w:val'];
  lvlText = normalizeLvlTextChar(lvlText);

  let customFormat;
  if (numFmt === 'custom') customFormat = numFmtTag?.attributes?.['w:format'];

  const lvlJc = currentLevel?.elements?.find((style) => style.name === 'w:lvlJc').attributes['w:val'];
  const pPr = currentLevel?.elements?.find((style) => style.name === 'w:pPr');
  const rPr = currentLevel?.elements?.find((style) => style.name === 'w:rPr');
  return { start, numFmt, lvlText, lvlJc, pPr, rPr, customFormat };
};

/**
 * Normalize the level text character to a standard format
 * @param {string} lvlText The level text to normalize
 * @returns {string} The normalized level text
 */
export function normalizeLvlTextChar(lvlText) {
  const normalizeChars = ['', '', '○', 'o', '■', '□'];
  if (!lvlText || !normalizeChars.includes(lvlText)) return lvlText;

  if (lvlText === '') lvlText = '•';
  if (lvlText === '○' || lvlText === 'o') lvlText = '◦';
  if (lvlText === '■' || lvlText === '') lvlText = '▪';
  if (lvlText === '□') lvlText = '◯';
  return lvlText;
}

/**
 * Main function to get list item information from numbering.xml
 *
 * @param {object} attributes
 * @param {int} level
 * @param {ParsedDocx} docx
 * @returns
 */
export function getNodeNumberingDefinition(item, level, docx) {
  if (!item) return {};
  const { attributes = {} } = item;

  const { paragraphProperties = {} } = attributes;
  const { elements: listStyles = [] } = paragraphProperties;
  const initialPpr = item.elements.find((el) => el.name === 'w:pPr');
  const styleTag = initialPpr?.elements?.find((el) => el.name === 'w:pStyle');
  const styleId = styleTag?.attributes['w:val'];

  const { numPr: numPrTag } = getNumPrRecursive({ node: item, styleId, docx });
  if (!numPrTag) return {};

  const numIdTag = numPrTag?.elements.find((style) => style.name === 'w:numId');
  const numId = numIdTag?.attributes['w:val'];

  const pStyle = listStyles.find((style) => style.name === 'w:pStyle');
  const pStyleId = pStyle?.attributes['w:val'];
  const {
    start,
    numFmt: listTypeDef,
    lvlText,
    lvlJc,
    pPr,
    rPr,
    customFormat,
  } = getListLevelDefinitionTag(numId, level, pStyleId, docx);

  // Properties - there can be run properties and paragraph properties
  let listpPrs, listrPrs;

  if (pPr) listpPrs = _processListParagraphProperties(pPr, initialPpr);
  if (rPr) listrPrs = _processListRunProperties(rPr);

  // Get style for this list level
  let listType;
  if (unorderedListTypes.includes(listTypeDef?.toLowerCase())) listType = 'bulletList';
  else if (orderedListTypes.includes(listTypeDef)) listType = 'orderedList';
  else if (listTypeDef === 'custom') {
    listType = 'orderedList';
  }
  // If we do not have a valid list, attempt to return a standard paragraph
  else {
    return {};
  }
  return { listType, listOrderingType: listTypeDef, listrPrs, listpPrs, start, lvlText, lvlJc, customFormat };
}

export function getNodeNumberingDefinitionByStyle(item, docx) {
  if (!item) return {};

  const initialPpr = item.elements?.find((el) => el.name === 'w:pPr');
  const styleTag = initialPpr?.elements?.find((el) => el.name === 'w:pStyle');
  const styleId = styleTag?.attributes['w:val'];
  const styleDef = getStyleTagFromStyleId(styleId, docx);
  if (!styleDef) return {};

  const pPr = styleDef.elements?.find((el) => el.name === 'w:pPr');
  const numPr = pPr?.elements?.find((el) => el.name === 'w:numPr');
  const numIdTag = numPr?.elements?.find((el) => el.name === 'w:numId');
  const numId = numIdTag?.attributes?.['w:val'];
  if (!numId) return {};

  const abstractNumId = getAbstractNumIdByNumId(numId, docx);
  if (!abstractNumId) return {};

  const levelData = getLevelDataFromAbstractNum(abstractNumId, styleId, docx);
  if (!levelData) return {};

  const definition = extractDefinitionFromLevel(levelData.level, initialPpr);

  return {
    definition,
    ilvl: levelData.ilvl,
  };
}

function getAbstractNumIdByNumId(numId, docx) {
  const numbering = docx['word/numbering.xml'];
  if (!numbering) return null;

  const { elements } = numbering;
  const listData = elements[0];
  const numberingElements = listData.elements || [];

  const numDef = numberingElements.find((el) => el.name === 'w:num' && el.attributes?.['w:numId'] === numId);

  if (!numDef) return null;

  const abstractNumIdRef = numDef.elements?.find((el) => el.name === 'w:abstractNumId');
  return abstractNumIdRef?.attributes?.['w:val'];
}

function getLevelDataFromAbstractNum(abstractNumId, styleId, docx) {
  const numbering = docx['word/numbering.xml'];
  if (!numbering) return null;

  const { elements } = numbering;
  const listData = elements[0];
  const numberingElements = listData.elements || [];

  const abstractNum = numberingElements.find(
    (el) => el.name === 'w:abstractNum' && el.attributes?.['w:abstractNumId'] === abstractNumId,
  );

  if (!abstractNum) return null;

  const levels = abstractNum.elements?.filter((el) => el.name === 'w:lvl') || [];
  for (const level of levels) {
    const pStyle = level.elements?.find((el) => el.name === 'w:pStyle');
    if (pStyle?.attributes?.['w:val'] === styleId) {
      const found = {
        level,
        ilvl: Number(level.attributes?.['w:ilvl']) || 0,
      };
      return found;
    }
  }

  const level0 = levels.find((level) => level.attributes?.['w:ilvl'] === '0');
  if (level0) {
    return {
      level: level0,
      ilvl: 0,
    };
  }

  return null;
}

function extractDefinitionFromLevel(level, initialPpr) {
  if (!level) return {};

  const start = level.elements?.find((el) => el.name === 'w:start')?.attributes?.['w:val'];

  let numFmtTag = level.elements?.find((el) => el.name === 'w:numFmt');
  let numFmt = numFmtTag?.attributes?.['w:val'];

  let lvlText = level.elements?.find((el) => el.name === 'w:lvlText')?.attributes?.['w:val'];
  lvlText = normalizeLvlTextChar(lvlText);

  let customFormat;
  if (numFmt === 'custom') customFormat = numFmtTag?.attributes?.['w:format'];

  const lvlJc = level.elements?.find((el) => el.name === 'w:lvlJc')?.attributes?.['w:val'];
  const pPr = level.elements?.find((el) => el.name === 'w:pPr');
  const rPr = level.elements?.find((el) => el.name === 'w:rPr');

  let listpPrs, listrPrs;
  if (pPr) listpPrs = _processListParagraphProperties(pPr, initialPpr);
  if (rPr) listrPrs = _processListRunProperties(rPr);

  let listType;
  if (unorderedListTypes.includes(numFmt?.toLowerCase())) {
    listType = 'bulletList';
  } else if (orderedListTypes.includes(numFmt)) {
    listType = 'orderedList';
  } else if (numFmt === 'custom') {
    listType = 'orderedList';
  } else {
    return {};
  }

  return {
    listType,
    listOrderingType: numFmt,
    listrPrs,
    listpPrs,
    start,
    lvlText,
    lvlJc,
    customFormat,
  };
}

export function getDefinitionForLevel(data, level) {
  return data?.elements?.find((item) => Number(item.attributes['w:ilvl']) === level);
}

export function parseIndentElement(indElem) {
  if (!indElem || !indElem.attributes) return {};
  const out = {};

  if (indElem.attributes['w:left'] != null) out.left = twipsToPixels(indElem.attributes['w:left']);
  if (indElem.attributes['w:right'] != null) out.right = twipsToPixels(indElem.attributes['w:right']);
  if (indElem.attributes['w:firstLine'] != null) out.firstLine = twipsToPixels(indElem.attributes['w:firstLine']);
  if (indElem.attributes['w:hanging'] != null) out.hanging = twipsToPixels(indElem.attributes['w:hanging']);
  if (indElem.attributes['w:leftChars'] != null) out.leftChars = twipsToPixels(indElem.attributes['w:leftChars']);
  return out;
}

export function combineIndents(ind1, ind2) {
  ind1 = ind1 && typeof ind1 === 'object' ? ind1 : {};
  ind2 = ind2 && typeof ind2 === 'object' ? ind2 : {};

  const indent = {};
  ['left', 'right', 'firstLine', 'hanging'].forEach((prop) => {
    const v1 = ind1[prop] !== undefined ? Number(ind1[prop]) : null;
    const v2 = ind2[prop] !== undefined ? Number(ind2[prop]) : null;

    if (v1 != null && v2 != null) {
      indent[prop] = prop === 'left' || prop === 'hanging' ? Math.max(v1, v2) : v1;
    } else if (v1 != null) {
      indent[prop] = v1;
    } else if (v2 != null) {
      indent[prop] = v2;
    }
  });

  return indent;
}

function _processListParagraphProperties(data, inlinePpr) {
  const { elements } = data;
  const expectedTypes = ['w:ind', 'w:jc', 'w:tabs'];
  const paragraphProperties = {};
  if (!elements) return paragraphProperties;

  elements.forEach((item) => {
    if (!expectedTypes.includes(item.name)) {
      console.warn(`[numbering.xml] Unexpected list paragraph prop found: ${item.name}`);
    }
  });

  const inlineIndent = inlinePpr?.elements?.find((item) => item.name === 'w:ind');
  const parsedInlineIndent = parseIndentElement(inlineIndent);
  const styleIndent = elements.find((item) => item.name === 'w:ind');

  // TODO: We need the style indent for presentation but it is not included in the node's indent attribute
  // eslint-disable-next-line no-unused-vars
  const parsedStyleIndent = parseIndentElement(styleIndent);

  paragraphProperties.indent = parsedInlineIndent;

  const justify = elements.find((item) => item.name === 'w:jc');
  if (justify) {
    const justifyAttrs = {};
    if (!justify.attributes) justify.attributes = {};
    if (justify.attributes['w:val'] !== undefined) justifyAttrs.val = justify.attributes['w:val'];
    paragraphProperties.justify = justifyAttrs;
  }

  const tabs = elements.find((item) => item.name === 'w:tabs');
  if (tabs) {
    const tabElements = tabs.elements.filter((item) => item.name === 'w:tab');
    const tabStops = [];
    tabElements.forEach((tab) => {
      const tabStop = {};
      if (!tab.attributes) tab.attributes = {};
      if (tab.attributes['w:val'] !== undefined) tabStop.val = tab.attributes['w:val'];
      if (tab.attributes['w:leader'] !== undefined) tabStop.leader = tab.attributes['w:leader'];
      if (tab.attributes['w:pos'] !== undefined) tabStop.pos = twipsToPixels(tab.attributes['w:pos']);
      tabStops.push(tabStop);
    });
    paragraphProperties.tabStops = tabStops;
  }
  return paragraphProperties;
}

function _processListRunProperties(data) {
  const { elements } = data;
  const expectedTypes = [
    'w:rFonts',
    'w:b',
    'w:bCs',
    'w:i',
    'w:iCs',
    'w:strike',
    'w:dstrike',
    'w:color',
    'w:sz',
    'w:szCs',
    'w:u',
    'w:bdr',
    'w:shd',
    'w:vertAlign',
    'w:jc',
    'w:spacing',
    'w:w',
    'w:smallCaps',
    'w:position',
    'w:lang',
  ];
  const runProperties = {};
  if (!elements) return runProperties;

  elements.forEach((item) => {
    if (!expectedTypes.includes(item.name)) {
      // console.warn(`[numbering.xml] Unexpected list run prop found: ${item.name}`);
    }
    const { attributes = {} } = item;
    Object.keys(attributes).forEach((key) => {
      runProperties[key] = attributes[key];
    });
  });
  return runProperties;
}

export const docxNumberigHelpers = {
  getListLevelDefinitionTag,
  combineIndents,
  parseIndentElement,
  generateListPath,
  normalizeLvlTextChar,
};
