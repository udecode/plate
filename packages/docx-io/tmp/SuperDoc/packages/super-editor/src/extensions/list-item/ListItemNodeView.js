import { LinkedStylesPluginKey } from '../linked-styles/index.js';
import { getMarkType } from '@core/helpers/index.js';
import { parseSizeUnit } from '@core/utilities/index.js';
import { parseIndentElement, combineIndents } from '@core/super-converter/v2/importer/listImporter.js';
import { generateOrderedListIndex } from '@helpers/orderedListUtils.js';
import { getListItemStyleDefinitions } from '@helpers/list-numbering-helpers.js';
import { docxNumberigHelpers } from '@/core/super-converter/v2/importer/listImporter.js';

const MARKER_PADDING = 6;
const MARKER_OFFSET_RIGHT = 4;
const MIN_MARKER_WIDTH = 20;
const POINT_TO_PIXEL_CONVERSION_FACTOR = 1.33;
const DEFAULT_FONT_FAMILY = 'Arial, sans-serif';
const DEFAULT_FONT_SIZE = '10pt';

const IS_DEBUGGING = false;

/**
 * @typedef {Object} IndentObject
 * @property {number} [left] - The left indent value
 * @property {number} [right] - The right indent value
 * @property {number} [firstLine] - The first line indent value
 * @property {number} [hanging] - The hanging indent value
 */

/**
 * The node view for the list item
 * @param {Node} node - The node to be rendered
 * @param {function} getPos - A function to get the position of the node
 * @param {Array} decorations - An array of decorations
 * @param {Editor} editor - The editor instance
 * @returns {ListItemNodeView} The node view instance
 */
// Add a registry to track active node views
const activeListItemNodeViews = new Set();

export class ListItemNodeView {
  constructor(node, getPos, decorations, editor) {
    this.node = node;
    this.editor = editor;
    this.decorations = decorations;
    this.view = editor.view;
    this.getPos = getPos;

    // Register this node view
    activeListItemNodeViews.add(this);

    this.#init();
  }

  #init() {
    const { attrs } = this.node;
    const { listLevel, listNumberingType, lvlText, numId, level, customFormat } = attrs;

    let orderMarker = '';
    if (listLevel) {
      if (listNumberingType !== 'bullet') {
        orderMarker = generateOrderedListIndex({
          listLevel,
          lvlText: lvlText,
          listNumberingType,
          customFormat,
        });
      } else {
        orderMarker = docxNumberigHelpers.normalizeLvlTextChar(lvlText);
      }
    }

    const pos = this.getPos();
    const { fontSize, fontFamily, lineHeight } = getTextStyleMarksFromLinkedStyles({
      node: this.node,
      pos,
      editor: this.editor,
    });

    // Container for the entire node view
    this.dom = document.createElement('li');
    this.dom.className = 'sd-editor-list-item-node-view';
    this.dom.style.fontSize = fontSize;
    this.dom.style.fontFamily = fontFamily ? fontFamily : 'inherit';
    this.dom.style.lineHeight = lineHeight || '';
    this.dom.setAttribute('data-marker-type', orderMarker);
    this.dom.setAttribute('data-num-id', numId);
    this.dom.setAttribute('data-list-level', JSON.stringify(listLevel));
    this.dom.setAttribute('data-list-numbering-type', listNumberingType);
    this.dom.setAttribute('data-level', level);

    // A container for the numbering
    this.numberingDOM = document.createElement('span');
    this.numberingDOM.className = 'sd-editor-list-item-numbering';
    this.numberingDOM.textContent = orderMarker;
    this.numberingDOM.setAttribute('contenteditable', 'false');
    this.numberingDOM.addEventListener('click', this.handleNumberingClick);

    // Container for the content
    this.contentDOM = document.createElement('div');
    this.contentDOM.className = 'sd-editor-list-item-content-dom';

    this.dom.appendChild(this.numberingDOM);
    this.dom.appendChild(this.contentDOM);

    // Apply initial indent styling
    this.refreshIndentStyling();
  }

  refreshIndentStyling() {
    const { attrs } = this.node;
    const { styleId, numId, level, indent: inlineIndent } = attrs;

    const defs = getListItemStyleDefinitions({ styleId, node: this.node, numId, level, editor: this.editor });
    const visibleIndent = getVisibleIndent(defs.stylePpr, defs.numDefPpr, inlineIndent);
    const lvlJc = defs.numLvlJs?.attributes?.['w:val'] || 'left';

    const contentLeft = visibleIndent.left || 0;
    const hanging = visibleIndent.hanging || 0;

    const handlers = {
      right: () => {
        const calculatedWidth = calculateMarkerWidth(this.dom, this.numberingDOM, this.editor);
        const minMarkerWidth = Math.max(calculatedWidth, MIN_MARKER_WIDTH);
        const effectiveHanging = Math.max(hanging, minMarkerWidth);
        const markerLeft = contentLeft - effectiveHanging - MARKER_OFFSET_RIGHT;
        this.contentDOM.style.marginLeft = `${contentLeft}px`;
        this.numberingDOM.style.left = `${markerLeft}px`;
        this.numberingDOM.style.width = `${effectiveHanging}px`;
        this.numberingDOM.style.textAlign = 'right';
      },
      left: () => {
        const calculatedWidth = calculateMarkerWidth(this.dom, this.numberingDOM, this.editor);
        const minMarkerWidth = Math.max(calculatedWidth, MIN_MARKER_WIDTH);
        let markerLeft = contentLeft - hanging;
        if (markerLeft === contentLeft) {
          markerLeft -= minMarkerWidth;
        } else if (minMarkerWidth > hanging) {
          const diff = minMarkerWidth - hanging;
          markerLeft -= diff;
        }
        this.contentDOM.style.marginLeft = `${contentLeft}px`;
        this.numberingDOM.style.left = `${markerLeft}px`;
        this.numberingDOM.style.width = '';
        this.numberingDOM.style.textAlign = '';
      },
    };

    const handleStyles = handlers[lvlJc] ?? handlers.left;

    handleStyles();
  }

  handleNumberingClick = () => {
    // Respond to numbering clicks here in the future
    // ie: open a modal to customize numbering
  };

  update(node, decorations) {
    this.node = node;
    this.decorations = decorations;

    const { fontSize, fontFamily, lineHeight } = getTextStyleMarksFromLinkedStyles({
      node,
      pos: this.getPos(),
      editor: this.editor,
    });
    this.dom.style.fontSize = fontSize;
    this.dom.style.fontFamily = fontFamily || 'inherit';
    this.dom.style.lineHeight = lineHeight || '';
  }

  destroy() {
    // Unregister this node view
    activeListItemNodeViews.delete(this);
    this.numberingDOM.removeEventListener('click', this.handleNumberingClick);
  }
}

// Export function to refresh all active list item node views
export function refreshAllListItemNodeViews() {
  activeListItemNodeViews.forEach((nodeView) => {
    try {
      nodeView.refreshIndentStyling();
    } catch (error) {
      console.error('Error refreshing list item node view:', error);
      // Remove broken node views from the set
      activeListItemNodeViews.delete(nodeView);
    }
  });
}

/**
 * Get the text style marks from a list item
 * @param {Node} listItem - The list item node
 * @param {MarkType} markType - The mark type to look for
 * @returns {Object} An array of text style marks and attrs object
 */
function getListItemTextStyleMarks(listItem, markType) {
  let textStyleMarks = [];
  let attrs = {};
  listItem.forEach((childNode) => {
    if (childNode.type.name !== 'paragraph') return;
    attrs.lineHeight = childNode.attrs.lineHeight;
    childNode.forEach((textNode) => {
      let isTextNode = textNode.type.name === 'text';
      let hasTextStyleMarks = markType.isInSet(textNode.marks);
      if (isTextNode && hasTextStyleMarks) {
        let marks = textNode.marks.filter((mark) => mark.type === markType);
        textStyleMarks.push(...marks);
      }
    });
  });
  return {
    marks: textStyleMarks,
    attrs,
  };
}

/**
 * Pull font and size defaults from linked styles,
 * then override them if there are any textStyle marks on this node.
 * @param {Object} params - The parameters
 * @param {Node} params.node - The node to get the styles from
 * @param {number} params.pos - The position of the node
 * @param {Editor} params.editor - The editor instance
 * @returns {Object} The font and size styles
 * @property {string} fontSize - The font size
 * @property {string} fontFamily - The font family
 */
function getTextStyleMarksFromLinkedStyles({ node, pos, editor }) {
  // 1. Get the “base” font + size from linked styles
  const { font: defaultFont, size: defaultSize } = getStylesFromLinkedStyles({ node, pos, editor });

  // 2. Find all textStyle marks on this node
  const textStyleType = getMarkType('textStyle', editor.schema);
  const { marks: allMarks, attrs: allAttrs } = getListItemTextStyleMarks(node, textStyleType);
  const styleMarks = allMarks.filter((m) => m.type === textStyleType);

  // 3. Helpers to find the first mark that has a fontSize / fontFamily attr
  const sizeMark = styleMarks.find((m) => m.attrs.fontSize);
  const familyMark = styleMarks.find((m) => m.attrs.fontFamily);
  const lineHeight = allAttrs.lineHeight;

  // 4. Compute final fontSize (parse it, fall back to default if invalid)
  let fontSize = sizeMark
    ? (() => {
        const [value, unit = 'pt'] = parseSizeUnit(sizeMark.attrs.fontSize);
        return Number.isNaN(value) ? defaultSize : `${value}${unit}`;
      })()
    : defaultSize;

  // 5. Compute final fontFamily (or fall back)
  let fontFamily = familyMark?.attrs.fontFamily ?? defaultFont;

  const firstChild = node.firstChild;
  const hasOnlyOnePar = node.childCount === 1 && firstChild?.type.name === 'paragraph';

  // If a list item contains only one annotation,
  // then we try to take the font from there.
  if (hasOnlyOnePar) {
    const par = firstChild;
    const parFirstChild = par?.firstChild;
    if (par?.childCount === 1 && parFirstChild?.type.name === 'fieldAnnotation') {
      const aFontSize = parFirstChild.attrs.fontSize;
      const aFontFamily = parFirstChild.attrs.fontFamily;
      if (!sizeMark && aFontSize) fontSize = aFontSize;
      if (!familyMark && aFontFamily) fontFamily = aFontFamily;
    }
  }

  return { fontSize, fontFamily, lineHeight };
}

/**
 * Get the styles from linked styles
 * @param {Object} param0
 * @param {Node} param0.node - The node to get the styles from
 * @param {number} param0.pos - The position of the node
 * @param {Editor} param0.editor - The editor instance
 * @returns {Object} The styles
 * @property {string} font - The font family
 * @property {string} size - The font size
 */
const getStylesFromLinkedStyles = ({ node, pos, editor }) => {
  const { state } = editor.view;
  const linkedStyles = LinkedStylesPluginKey.getState(state)?.decorations;
  const decorationsInPlace = linkedStyles?.find(pos, pos + node.nodeSize);

  // Predicates by priority.
  const predicates = [
    (style) => style.includes('font-size') && style.includes('font-family'),
    (style) => style.includes('font-size'),
    (style) => style.includes('font-family'),
  ];

  let styleDeco;
  for (const predicateFn of predicates) {
    styleDeco = decorationsInPlace?.find((dec) => {
      const style = dec.type.attrs?.style || '';
      return style && predicateFn(style);
    });
    if (styleDeco) break;
  }

  const style = styleDeco?.type.attrs?.style;

  const stylesArray = style?.split(';') || [];
  const fontSizeFromStyles = stylesArray
    .find((s) => s.includes('font-size'))
    ?.split(':')[1]
    .trim();
  const fontFamilyFromStyles = stylesArray
    .find((s) => s.includes('font-family'))
    ?.split(':')[1]
    .trim();

  return {
    font: fontFamilyFromStyles,
    size: fontSizeFromStyles,
  };
};

/**
 * Calculate the visible indent for a list item.
 * This is the combination of the style and num definitions.
 * @param {DocxNode} stylePpr stylePpr The style paragraph properties docx node
 * @param {DocxNode} numDefPpr The num definition paragraph properties docx node
 * @returns {IndentObject} The visible indent object
 */
export const getVisibleIndent = (stylePpr, numDefPpr, inlineIndent) => {
  if (IS_DEBUGGING) console.debug('[getVisibleIndent] inlineIndent', inlineIndent);

  const styleIndentTag = stylePpr?.elements?.find((el) => el.name === 'w:ind') || {};
  const styleIndent = parseIndentElement(styleIndentTag);

  if (IS_DEBUGGING) console.debug('[getVisibleIndent] styleIndent', styleIndent, styleIndentTag);

  const numDefIndentTag = numDefPpr?.elements?.find((el) => el.name === 'w:ind') || {};
  const numDefIndent = parseIndentElement(numDefIndentTag);
  if (IS_DEBUGGING) console.debug('[getVisibleIndent] numDefIndent', numDefIndent, numDefIndentTag, '\n\n');

  const indent = combineIndents(styleIndent, numDefIndent);
  const result = combineIndents(indent, inlineIndent);
  return result;
};

/**
 * Calculate the width of the list item marker.
 * @param {HTMLElement} dom - The DOM element of the list item.
 * @param {HTMLElement} numberingDOM - The DOM element of the numbering.
 * @param {Editor} editor - The editor instance.
 * @param {Object} param2 - Additional parameters.
 * @param {boolean} param2.withPadding - Whether to include padding in the calculation.
 * @returns {number} The width of the marker.
 */
function calculateMarkerWidth(dom, numberingDOM, editor, { withPadding = true } = {}) {
  const markerText = numberingDOM.textContent || '';
  const fontSize = dom.style.fontSize || DEFAULT_FONT_SIZE;
  const fontValue = dom.style.fontFamily;
  const fontFamily = fontValue && fontValue !== 'inherit' ? fontValue : DEFAULT_FONT_FAMILY;

  if (!markerText.trim()) return 0;

  try {
    // If we're in headless mode, we can't use canvas, so we return 0
    if (editor?.options?.isHeadless) return 0;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const fontSizePx = fontSize.includes('pt')
      ? Number.parseFloat(fontSize) * POINT_TO_PIXEL_CONVERSION_FACTOR
      : Number.parseFloat(fontSize);

    context.font = `${fontSizePx}px ${fontFamily}`;
    const textWidth = context.measureText(markerText).width;
    const resultWidth = withPadding ? Math.ceil(textWidth + MARKER_PADDING) : Math.ceil(textWidth);
    return resultWidth;
  } catch {
    return 0;
  }
}
