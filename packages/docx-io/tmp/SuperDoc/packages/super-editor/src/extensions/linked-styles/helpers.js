import { CustomSelectionPluginKey } from '../custom-selection/custom-selection.js';
import { getLineHeightValueString } from '@core/super-converter/helpers.js';
import { findParentNode } from '@helpers/index.js';
import { kebabCase } from '@harbour-enterprises/common';

/**
 * Get the (parsed) linked style from the styles.xml
 *
 * @param {String} styleId The styleId of the linked style
 * @param {Array[Object]} styles The styles array
 * @returns {Object} The linked style
 */
export const getLinkedStyle = (styleId, styles = []) => {
  const linkedStyle = styles.find((style) => style.id === styleId);
  const basedOn = linkedStyle?.definition?.attrs?.basedOn;
  const basedOnStyle = styles.find((style) => style.id === basedOn);
  return { linkedStyle, basedOnStyle };
};

export const getSpacingStyle = (spacing) => {
  const { lineSpaceBefore, lineSpaceAfter, line, lineRule } = spacing;
  return {
    'margin-top': lineSpaceBefore + 'px',
    'margin-bottom': lineSpaceAfter + 'px',
    ...getLineHeightValueString(line, '', lineRule, true),
  };
};

/**
 * Convert spacing object to a style string
 *
 * @param {Object} spacing The spacing object
 * @returns {String} The style string
 */
export const getSpacingStyleString = (spacing) => {
  const { lineSpaceBefore, lineSpaceAfter, line } = spacing;
  return `
    ${lineSpaceBefore ? `margin-top: ${lineSpaceBefore}px;` : ''}
    ${lineSpaceAfter ? `margin-bottom: ${lineSpaceAfter}px;` : ''}
    ${line ? getLineHeightValueString(line, '') : ''}
  `.trim();
};

export const getMarksStyle = (attrs) => {
  let styles = '';
  for (const attr of attrs) {
    switch (attr.type) {
      case 'bold':
        styles += `font-weight: bold; `;
        break;
      case 'italic':
        styles += `font-style: italic; `;
        break;
      case 'underline':
        styles += `text-decoration: underline; `;
        break;
      case 'highlight':
        styles += `background-color: ${attr.attrs.color}; `;
        break;
      case 'textStyle':
        const { fontFamily, fontSize } = attr.attrs;
        styles += `${fontFamily ? `font-family: ${fontFamily};` : ''} ${fontSize ? `font-size: ${fontSize};` : ''}`;
    }
  }

  return styles.trim();
};

export const getQuickFormatList = (editor) => {
  if (!editor?.converter) return [];
  const styles = editor.converter.linkedStyles || [];
  return styles
    .filter((style) => {
      return style.type === 'paragraph' && style.definition.attrs;
    })
    .sort((a, b) => {
      return a.definition.attrs?.name.localeCompare(b.definition.attrs?.name);
    });
};

/**
 * Convert the linked styles and current node marks into a decoration string
 * If the node contains a given mark, we don't override it with the linked style per MS Word behavior
 *
 * @param {Object} linkedStyle The linked style object
 * @param {Object} basedOnStyle The basedOn style object
 * @param {Object} node The current node
 * @param {Object} parent The parent of current
 * @returns {String} The style string
 */
export const generateLinkedStyleString = (linkedStyle, basedOnStyle, node, parent, includeSpacing = true) => {
  if (!linkedStyle?.definition?.styles) return '';
  const markValue = {};

  const linkedDefinitionStyles = { ...linkedStyle.definition.styles };
  const basedOnDefinitionStyles = { ...basedOnStyle?.definition?.styles };
  const resultStyles = { ...linkedDefinitionStyles };

  if (!linkedDefinitionStyles['font-size'] && basedOnDefinitionStyles['font-size']) {
    resultStyles['font-size'] = basedOnDefinitionStyles['font-size'];
  }
  if (!linkedDefinitionStyles['text-transform'] && basedOnDefinitionStyles['text-transform']) {
    resultStyles['text-transform'] = basedOnDefinitionStyles['text-transform'];
  }

  Object.entries(resultStyles).forEach(([k, value]) => {
    const key = kebabCase(k);
    const flattenedMarks = [];

    // Flatten node marks (including text styles) for comparison
    node?.marks?.forEach((n) => {
      if (n.type.name === 'textStyle') {
        Object.entries(n.attrs).forEach(([styleKey, value]) => {
          const parsedKey = kebabCase(styleKey);
          if (!value) return;
          flattenedMarks.push({ key: parsedKey, value });
        });
        return;
      }

      flattenedMarks.push({ key: n.type.name, value: n.attrs[key] });
    });

    // Check if this node has the expected mark. If yes, we are not overriding it
    const mark = flattenedMarks.find((n) => n.key === key);
    const hasParentIndent = Object.keys(parent?.attrs?.indent || {});
    const hasParentSpacing = Object.keys(parent?.attrs?.spacing || {});

    const listTypes = ['orderedList', 'listItem'];

    // If no mark already in the node, we override the style
    if (!mark) {
      if (key === 'spacing' && includeSpacing && !hasParentSpacing) {
        const space = getSpacingStyle(value);
        Object.entries(space).forEach(([k, v]) => {
          markValue[k] = v;
        });
      } else if (key === 'indent' && includeSpacing && !hasParentIndent) {
        const { leftIndent, rightIndent, firstLine } = value;

        if (leftIndent) markValue['margin-left'] = leftIndent + 'px';
        if (rightIndent) markValue['margin-right'] = rightIndent + 'px';
        if (firstLine) markValue['text-indent'] = firstLine + 'px';
      } else if (key === 'bold' && node) {
        const val = value?.value;
        if (!listTypes.includes(node.type.name) && val !== '0') {
          markValue['font-weight'] = 'bold';
        }
      } else if (key === 'text-transform' && node) {
        if (!listTypes.includes(node.type.name)) {
          markValue[key] = value;
        }
      } else if (key === 'font-size' && node) {
        if (!listTypes.includes(node.type.name)) {
          markValue[key] = value;
        }
      } else if (key === 'color' && node) {
        if (!listTypes.includes(node.type.name)) {
          markValue[key] = value;
        }
      } else if (typeof value === 'string') {
        markValue[key] = value;
      }
    }
  });

  const final = Object.entries(markValue)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';');
  return final;
};

/**
 * Helper function to apply a linked style to a transaction
 *
 * @param {Transaction} tr The transaction to mutate
 * @param {Editor} editor The editor instance
 * @param {object} style The linked style to apply
 * @returns {boolean} Whether the transaction was modified
 */
export const applyLinkedStyleToTransaction = (tr, editor, style) => {
  if (!style) return false;

  let selection = tr.selection;
  const state = editor.state;

  // Check for preserved selection from custom selection plugin
  const focusState = CustomSelectionPluginKey.getState(state);
  if (selection.empty && focusState?.preservedSelection) {
    selection = focusState.preservedSelection;
    tr.setSelection(selection);
  }
  // Fallback to lastSelection if no preserved selection
  else if (selection.empty && editor.options.lastSelection) {
    selection = editor.options.lastSelection;
    tr.setSelection(selection);
  }

  const { from, to } = selection;

  // Function to get clean paragraph attributes (strips existing styles)
  const getCleanParagraphAttrs = (node) => {
    const cleanAttrs = {};
    const preservedAttrs = ['id', 'class'];

    preservedAttrs.forEach((attr) => {
      if (node.attrs[attr] !== undefined) {
        cleanAttrs[attr] = node.attrs[attr];
      }
    });

    // Apply the new style
    cleanAttrs.styleId = style.id;

    return cleanAttrs;
  };

  // Function to clear formatting marks from text content
  const clearFormattingMarks = (startPos, endPos) => {
    tr.doc.nodesBetween(startPos, endPos, (node, pos) => {
      if (node.isText && node.marks.length > 0) {
        const marksToRemove = [
          'textStyle',
          'bold',
          'italic',
          'underline',
          'strike',
          'subscript',
          'superscript',
          'highlight',
        ];

        node.marks.forEach((mark) => {
          if (marksToRemove.includes(mark.type.name)) {
            tr.removeMark(pos, pos + node.nodeSize, mark);
          }
        });
      }
      return true;
    });
  };

  // Handle cursor position (no selection)
  if (from === to) {
    let pos = from;
    let paragraphNode = tr.doc.nodeAt(from);

    if (paragraphNode?.type.name !== 'paragraph') {
      const parentNode = findParentNode((node) => node.type.name === 'paragraph')(selection);
      if (!parentNode) return false;
      pos = parentNode.pos;
      paragraphNode = parentNode.node;
    }

    // Clear formatting marks within the paragraph
    clearFormattingMarks(pos + 1, pos + paragraphNode.nodeSize - 1);

    // Apply clean paragraph attributes
    tr.setNodeMarkup(pos, undefined, getCleanParagraphAttrs(paragraphNode));
    return true;
  }

  // Handle selection spanning multiple nodes
  const paragraphPositions = [];

  tr.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name === 'paragraph') {
      paragraphPositions.push({ node, pos });
    }
    return true;
  });

  // Apply style to all paragraphs in selection (with clean attributes and cleared marks)
  paragraphPositions.forEach(({ node, pos }) => {
    // Clear formatting marks within this paragraph
    clearFormattingMarks(pos + 1, pos + node.nodeSize - 1);

    // Apply clean paragraph attributes
    tr.setNodeMarkup(pos, undefined, getCleanParagraphAttrs(node));
  });

  return true;
};
