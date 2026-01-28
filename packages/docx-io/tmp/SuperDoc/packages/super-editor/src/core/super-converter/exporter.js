import he from 'he';
import { DOMParser as PMDOMParser } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { SuperConverter } from './SuperConverter.js';
import {
  emuToPixels,
  getTextIndentExportValue,
  inchesToTwips,
  linesToTwips,
  pixelsToEightPoints,
  pixelsToEmu,
  pixelsToTwips,
  ptToTwips,
  rgbToHex,
} from './helpers.js';
import { generateDocxRandomId } from '@helpers/generateDocxRandomId.js';
import { DEFAULT_DOCX_DEFS } from './exporter-docx-defs.js';
import { TrackDeleteMarkName, TrackFormatMarkName, TrackInsertMarkName } from '@extensions/track-changes/constants.js';
import { carbonCopy } from '../utilities/carbonCopy.js';
import { translateCommentNode } from './v2/exporter/commentsExporter.js';
import { createColGroup } from '@extensions/table/tableHelpers/createColGroup.js';
import { sanitizeHtml } from '../InputRule.js';
import { ListHelpers } from '@helpers/list-numbering-helpers.js';
import { translateChildNodes } from './v2/exporter/helpers/index.js';
import { translateDocumentSection } from './v2/exporter/index.js';

/**
 * @typedef {Object} ExportParams
 * @property {Object} node JSON node to translate (from PM schema)
 * @property {Object} bodyNode The stored body node to restore, if available
 * @property {Object[]} relationships The relationships to add to the document
 */

/**
 * @typedef {Object} SchemaNode
 * @property {string} type The name of this node from the prose mirror schema
 * @property {Array<SchemaNode>} content The child nodes
 * @property {Object} attrs The node attributes
 * /

/**
 * @typedef {Object} XmlReadyNode
 * @property {string} name The XML tag name
 * @property {Array<XmlReadyNode>} elements The child nodes
 * @property {Object} attributes The node attributes
 */

/**
 * @typedef {Object.<string, *>} SchemaAttributes
 * Key value pairs representing the node attributes from prose mirror
 */

/**
 * @typedef {Object.<string, *>} XmlAttributes
 * Key value pairs representing the node attributes to export to XML format
 */

/**
 * @typedef {Object} MarkType
 * @property {string} type The mark type
 * @property {Object} attrs Any attributes for this mark
 */

/**
 * Main export function. It expects the prose mirror data as JSON (ie: a doc node)
 *
 * @param {ExportParams} params - The parameters object, containing a node and possibly a body node
 * @returns {XmlReadyNode} The complete document node in XML-ready format
 */
export function exportSchemaToJson(params) {
  const { type } = params.node || {};

  // Node handlers for each node type that we can export
  const router = {
    doc: translateDocumentNode,
    body: translateBodyNode,
    heading: translateHeadingNode,
    paragraph: translateParagraphNode,
    text: translateTextNode,
    bulletList: translateList,
    orderedList: translateList,
    lineBreak: translateLineBreak,
    table: translateTable,
    tableRow: translateTableRow,
    tableCell: translateTableCell,
    bookmarkStart: translateBookmarkStart,
    fieldAnnotation: translateFieldAnnotation,
    tab: translateTab,
    image: translateImageNode,
    hardBreak: translateHardBreak,
    commentRangeStart: () => translateCommentNode(params, 'Start'),
    commentRangeEnd: () => translateCommentNode(params, 'End'),
    commentReference: () => null,
    shapeContainer: translateShapeContainer,
    shapeTextbox: translateShapeTextbox,
    contentBlock: translateContentBlock,
    structuredContent: translateStructuredContent,
    documentSection: translateDocumentSection,
    'page-number': translatePageNumberNode,
    'total-page-number': translateTotalPageNumberNode,
  };

  if (!router[type]) {
    console.error('No translation function found for node type:', type);
    return null;
  }

  // Call the handler for this node type
  return router[type](params);
}

/**
 * There is no body node in the prose mirror schema, so it is stored separately
 * and needs to be restored here.
 *
 * @param {ExportParams} params
 * @returns {XmlReadyNode} JSON of the XML-ready body node
 */
function translateBodyNode(params) {
  let sectPr = params.bodyNode?.elements.find((n) => n.name === 'w:sectPr') || {};

  if (params.converter) {
    const hasHeader = sectPr?.elements?.some((n) => n.name === 'w:headerReference');
    const hasDefaultHeader = params.converter.headerIds?.default;
    if (!hasHeader && hasDefaultHeader && !params.editor.options.isHeaderOrFooter) {
      const defaultHeader = generateDefaultHeaderFooter('header', params.converter.headerIds?.default);
      sectPr.elements.push(defaultHeader);
    }

    const hasFooter = sectPr?.elements?.some((n) => n.name === 'w:footerReference');
    const hasDefaultFooter = params.converter.footerIds?.default;
    if (!hasFooter && hasDefaultFooter && !params.editor.options.isHeaderOrFooter) {
      const defaultFooter = generateDefaultHeaderFooter('footer', params.converter.footerIds?.default);
      sectPr.elements.push(defaultFooter);
    }

    const newMargins = params.converter.pageStyles.pageMargins;
    const sectPrMargins = sectPr.elements.find((n) => n.name === 'w:pgMar');
    const { attributes } = sectPrMargins;
    Object.entries(newMargins).forEach(([key, value]) => {
      const convertedValue = inchesToTwips(value);
      attributes[`w:${key}`] = convertedValue;
    });
    sectPrMargins.attributes = attributes;
  }

  const elements = translateChildNodes(params);

  if (params.isHeaderFooter) {
    return {
      name: 'w:body',
      elements: [...elements],
    };
  }

  return {
    name: 'w:body',
    elements: [...elements, sectPr],
  };
}

const generateDefaultHeaderFooter = (type, id) => {
  return {
    type: 'element',
    name: `w:${type}Reference`,
    attributes: {
      'w:type': 'default',
      'r:id': id,
    },
  };
};

/**
 * Translate a heading node to a paragraph with Word heading style
 *
 * @param {ExportParams} params The parameters object containing the heading node
 * @returns {XmlReadyNode} JSON of the XML-ready paragraph node with heading style
 */
function translateHeadingNode(params) {
  const { node } = params;
  const { level = 1, ...otherAttrs } = node.attrs;

  // Convert heading to paragraph with appropriate Word heading style
  const paragraphNode = {
    type: 'paragraph',
    content: node.content,
    attrs: {
      ...otherAttrs,
      styleId: `Heading${level}`, // Maps to Heading1, Heading2, etc. in Word
    },
  };

  // Use existing paragraph translator with the modified node
  return translateParagraphNode({ ...params, node: paragraphNode });
}

/**
 * Translate a paragraph node
 *
 * @param {ExportParams} node A prose mirror paragraph node
 * @returns {XmlReadyNode} JSON of the XML-ready paragraph node
 */
export function translateParagraphNode(params) {
  const elements = translateChildNodes(params);

  // Replace current paragraph with content of html annotation
  const htmlAnnotationChild = elements.find((element) => element.name === 'htmlAnnotation');
  if (htmlAnnotationChild) {
    return htmlAnnotationChild.elements;
  }

  // Insert paragraph properties at the beginning of the elements array
  const pPr = generateParagraphProperties(params.node);
  if (pPr) elements.unshift(pPr);

  let attributes = {};
  if (params.node.attrs?.rsidRDefault) {
    attributes['w:rsidRDefault'] = params.node.attrs.rsidRDefault;
  }

  const result = {
    name: 'w:p',
    elements,
    attributes,
  };

  return result;
}

/**
 * Normalize line height values
 * This function converts line height values from strings with percentage to a decimal value.
 * For example, "150%" becomes 1.5.
 * If the value is not a valid number, it returns null.
 * @param {string|number} value The line height value to normalize
 * @return {number|null} The normalized line height value or null if invalid
 */
function normalizeLineHeight(value) {
  if (typeof value === 'string' && value.trim().endsWith('%')) {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed / 100 : null;
  }

  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Generate the w:pPr props for a paragraph node
 *
 * @param {SchemaNode} node
 * @returns {XmlReadyNode} The paragraph properties node
 */
function generateParagraphProperties(node) {
  const { attrs = {} } = node;

  const pPrElements = [];

  const { styleId } = attrs;
  if (styleId) pPrElements.push({ name: 'w:pStyle', attributes: { 'w:val': styleId } });

  const { spacing, indent, textAlign, textIndent, lineHeight, marksAttrs, keepLines, keepNext, dropcap } = attrs;
  if (spacing) {
    const { lineSpaceBefore, lineSpaceAfter, lineRule } = spacing;

    const attributes = {};

    // Zero values have to be considered in export to maintain accurate line height
    if (lineSpaceBefore >= 0) attributes['w:before'] = pixelsToTwips(lineSpaceBefore);
    if (lineSpaceAfter >= 0) attributes['w:after'] = pixelsToTwips(lineSpaceAfter);

    const normalized = normalizeLineHeight(lineHeight);
    if (normalized !== null) {
      if (lineRule === 'exact') {
        attributes['w:line'] = ptToTwips(normalized);
      } else {
        attributes['w:line'] = linesToTwips(normalized);
      }
    }

    attributes['w:lineRule'] = lineRule || 'auto';

    const spacingElement = {
      name: 'w:spacing',
      attributes,
    };
    pPrElements.push(spacingElement);
  }

  if (lineHeight && !spacing) {
    const spacingElement = {
      name: 'w:spacing',
      attributes: {
        'w:line': linesToTwips(lineHeight),
      },
    };
    pPrElements.push(spacingElement);
  }

  if (indent && Object.values(indent).some((v) => v !== 0)) {
    const { left, right, firstLine, hanging } = indent;
    const attributes = {};
    if (left || left === 0) attributes['w:left'] = pixelsToTwips(left);
    if (right || right === 0) attributes['w:right'] = pixelsToTwips(right);
    if (firstLine || firstLine === 0) attributes['w:firstLine'] = pixelsToTwips(firstLine);
    if (hanging || hanging === 0) attributes['w:hanging'] = pixelsToTwips(hanging);

    if (textIndent && !attributes['w:left']) {
      attributes['w:left'] = getTextIndentExportValue(textIndent);
    }

    const indentElement = {
      name: 'w:ind',
      attributes,
    };
    pPrElements.push(indentElement);
  } else if (textIndent && textIndent !== '0in') {
    const indentElement = {
      name: 'w:ind',
      attributes: {
        'w:left': getTextIndentExportValue(textIndent),
      },
    };
    pPrElements.push(indentElement);
  }

  if (textAlign) {
    const textAlignElement = {
      name: 'w:jc',
      attributes: { 'w:val': textAlign === 'justify' ? 'both' : textAlign },
    };
    pPrElements.push(textAlignElement);
  }

  if (marksAttrs) {
    const outputMarks = processOutputMarks(marksAttrs);
    const rPrElement = generateRunProps(outputMarks);
    pPrElements.push(rPrElement);
  }

  if (keepLines) {
    pPrElements.push({
      name: 'w:keepLines',
      attributes: { 'w:val': keepLines },
    });
  }

  if (keepNext) {
    pPrElements.push({
      name: 'w:keepNext',
      attributes: { 'w:val': keepNext },
    });
  }

  if (dropcap) {
    pPrElements.push({
      name: 'w:framePr',
      attributes: {
        'w:dropCap': dropcap.type,
        'w:lines': dropcap.lines,
        'w:wrap': dropcap.wrap,
        'w:vAnchor': dropcap.vAnchor,
        'w:hAnchor': dropcap.hAnchor,
      },
    });
  }

  const sectPr = node.attrs?.paragraphProperties?.sectPr;
  if (sectPr) {
    pPrElements.push(sectPr);
  }

  // Add tab stops
  const { tabStops } = attrs;
  if (tabStops && tabStops.length > 0) {
    const tabElements = tabStops.map((tab) => {
      const tabAttributes = {
        'w:val': tab.val || 'start',
        'w:pos': pixelsToTwips(tab.pos).toString(),
      };

      if (tab.leader) {
        tabAttributes['w:leader'] = tab.leader;
      }

      return {
        name: 'w:tab',
        attributes: tabAttributes,
      };
    });

    pPrElements.push({
      name: 'w:tabs',
      elements: tabElements,
    });
  }

  const numPr = node.attrs?.paragraphProperties?.elements?.find((n) => n.name === 'w:numPr');
  const hasNumPr = pPrElements.some((n) => n.name === 'w:numPr');
  if (numPr && !hasNumPr) pPrElements.push(numPr);
  if (!pPrElements.length) return null;

  return {
    name: 'w:pPr',
    elements: pPrElements,
  };
}

/**
 * Translate a document node
 *
 * @param {ExportParams} params The parameters object
 * @returns {XmlReadyNode} JSON of the XML-ready document node
 */
function translateDocumentNode(params) {
  const bodyNode = {
    type: 'body',
    content: params.node.content,
  };

  const translatedBodyNode = exportSchemaToJson({ ...params, node: bodyNode });
  const node = {
    name: 'w:document',
    elements: [translatedBodyNode],
    attributes: DEFAULT_DOCX_DEFS,
  };

  return [node, params];
}

/**
 * Helper function to be used for text node translation
 * Also used for transforming text annotations for the final submit
 *
 * @param {String} text Text node's content
 * @param {Object[]} marks The marks to add to the run properties
 * @returns {XmlReadyNode} The translated text node
 */

function getTextNodeForExport(text, marks, params) {
  const hasLeadingOrTrailingSpace = /^\s|\s$/.test(text);
  const space = hasLeadingOrTrailingSpace ? 'preserve' : null;
  const nodeAttrs = space ? { 'xml:space': space } : null;
  const textNodes = [];

  const outputMarks = processOutputMarks(marks);
  textNodes.push({
    name: 'w:t',
    elements: [{ text, type: 'text' }],
    attributes: nodeAttrs,
  });

  // For custom mark export, we need to add a bookmark start and end tag
  // And store attributes in the bookmark name
  if (params) {
    const { editor } = params;
    const customMarks = editor.extensionService.extensions.filter((e) => e.isExternal === true);

    marks.forEach((mark) => {
      const isCustomMark = customMarks.some((customMark) => {
        const customMarkName = customMark.name;
        return mark.type === customMarkName;
      });

      if (!isCustomMark) return;

      let attrsString = '';
      Object.entries(mark.attrs).forEach(([key, value]) => {
        if (value) {
          attrsString += `${key}=${value};`;
        }
      });

      if (isCustomMark) {
        textNodes.unshift({
          type: 'element',
          name: 'w:bookmarkStart',
          attributes: {
            'w:id': '5000',
            'w:name': mark.type + ';' + attrsString,
          },
        });
        textNodes.push({
          type: 'element',
          name: 'w:bookmarkEnd',
          attributes: {
            'w:id': '5000',
          },
        });
      }
    });
  }

  return wrapTextInRun(textNodes, outputMarks);
}

/**
 * Translate a text node or link node.
 * Link nodes look the same as text nodes but with a link attr.
 * Also, tracked changes are text marks so those need to be separated here.
 * We need to check here and re-route as necessary
 *
 * @param {ExportParams} params The text node to translate
 * @param {SchemaNode} params.node The text node from prose mirror
 * @returns {XmlReadyNode} The translated text node
 */
function translateTextNode(params) {
  const { node } = params;

  // Separate tracked changes from regular text
  const trackedMarks = [TrackInsertMarkName, TrackDeleteMarkName];
  const isTrackedNode = node.marks?.some((m) => trackedMarks.includes(m.type));
  if (isTrackedNode) return translateTrackedNode(params);

  // Separate links from regular text
  const isLinkNode = node.marks?.some((m) => m.type === 'link');
  if (isLinkNode) return translateLinkNode(params);

  const { text, marks = [] } = node;

  return getTextNodeForExport(text, marks, params);
}

function createTrackStyleMark(marks) {
  const trackStyleMark = marks.find((mark) => mark.type === TrackFormatMarkName);
  if (trackStyleMark) {
    const markElement = {
      type: 'element',
      name: 'w:rPrChange',
      attributes: {
        'w:id': trackStyleMark.attrs.id,
        'w:author': trackStyleMark.attrs.author,
        'w:authorEmail': trackStyleMark.attrs.authorEmail,
        'w:date': trackStyleMark.attrs.date,
      },
      elements: trackStyleMark.attrs.before.map((mark) => processOutputMarks([mark])).filter((r) => r !== undefined),
    };
    return markElement;
  }
  return undefined;
}

function translateTrackedNode(params) {
  const { node } = params;
  const marks = node.marks;
  const trackingMarks = [TrackInsertMarkName, TrackDeleteMarkName, TrackFormatMarkName];
  const trackedMark = marks.find((m) => trackingMarks.includes(m.type));
  const isInsert = trackedMark.type === TrackInsertMarkName;

  // Remove marks that we aren't exporting and add style mark if present
  const trackStyleMark = createTrackStyleMark(marks);
  node.marks = marks.filter((m) => !trackingMarks.includes(m.type));
  if (trackStyleMark) {
    node.marks.push(trackStyleMark);
  }

  const translatedTextNode = exportSchemaToJson({ ...params, node });

  // If this is not an insert, we need to change the text node name
  if (!isInsert) {
    const textNode = translatedTextNode.elements.find((n) => n.name === 'w:t');
    textNode.name = 'w:delText';
  }

  const trackedNode = {
    name: isInsert ? 'w:ins' : 'w:del',
    type: 'element',
    attributes: {
      'w:id': trackedMark.attrs.id,
      'w:author': trackedMark.attrs.author,
      'w:authorEmail': trackedMark.attrs.authorEmail,
      'w:date': trackedMark.attrs.date,
    },
    elements: [translatedTextNode],
  };

  return trackedNode;
}

/**
 * Wrap a text node in a run
 *
 * @param {XmlReadyNode} node
 * @returns {XmlReadyNode} The wrapped run node
 */
function wrapTextInRun(nodeOrNodes, marks) {
  let elements = [];
  if (Array.isArray(nodeOrNodes)) elements = nodeOrNodes;
  else elements = [nodeOrNodes];

  if (marks && marks.length) elements.unshift(generateRunProps(marks));
  return {
    name: 'w:r',
    elements,
  };
}

/**
 * Generate a w:rPr node (run properties) from marks
 *
 * @param {Object[]} marks The marks to add to the run properties
 * @returns
 */
function generateRunProps(marks = []) {
  return {
    name: 'w:rPr',
    elements: marks.filter((mark) => !!Object.keys(mark).length),
  };
}

/**
 * Get all marks as a list of MarkType objects
 *
 * @param {MarkType[]} marks
 * @returns
 */
function processOutputMarks(marks = []) {
  return marks.flatMap((mark) => {
    if (mark.type === 'textStyle') {
      return Object.entries(mark.attrs)
        .filter(([, value]) => value)
        .map(([key]) => {
          const unwrappedMark = { type: key, attrs: mark.attrs };
          return translateMark(unwrappedMark);
        });
    } else {
      return translateMark(mark);
    }
  });
}

/**
 * Translate link node. This is a special case because it requires adding a new relationship.
 *
 * @param {ExportParams} params
 * @returns {XmlReadyNode} The translated link node
 */
function translateLinkNode(params) {
  const { node } = params;

  const linkMark = node.marks.find((m) => m.type === 'link');
  const link = linkMark.attrs.href;

  let rId = linkMark.attrs.rId;
  if (!rId) {
    rId = addNewLinkRelationship(params, link);
  }

  node.marks = node.marks.filter((m) => m.type !== 'link');

  const outputNode = exportSchemaToJson({ ...params, node });
  const contentNode = processLinkContentNode(outputNode);

  const newNode = {
    name: 'w:hyperlink',
    type: 'element',
    attributes: {
      'r:id': rId,
    },
    elements: [contentNode],
  };

  return newNode;
}

function processLinkContentNode(node) {
  if (!node) return node;

  const contentNode = carbonCopy(node);
  if (!contentNode) return contentNode;

  const hyperlinkStyle = {
    name: 'w:rStyle',
    attributes: { 'w:val': 'Hyperlink' },
  };
  const color = {
    name: 'w:color',
    attributes: { 'w:val': '467886' },
  };
  const underline = {
    name: 'w:u',
    attributes: {
      'w:val': 'none',
    },
  };

  if (contentNode.name === 'w:r') {
    const runProps = contentNode.elements.find((el) => el.name === 'w:rPr');

    if (runProps) {
      const foundColor = runProps.elements.find((el) => el.name === 'w:color');
      const foundHyperlinkStyle = runProps.elements.find((el) => el.name === 'w:rStyle');
      const underlineMark = runProps.elements.find((el) => el.name === 'w:u');
      if (!foundColor) runProps.elements.unshift(color);
      if (!foundHyperlinkStyle) runProps.elements.unshift(hyperlinkStyle);
      if (!underlineMark) runProps.elements.unshift(underline);
    } else {
      // we don't add underline by default
      const runProps = {
        name: 'w:rPr',
        elements: [hyperlinkStyle, color],
      };

      contentNode.elements.unshift(runProps);
    }
  }

  return contentNode;
}

/**
 * Create a new link relationship and add it to the relationships array
 *
 * @param {ExportParams} params
 * @param {string} link The URL of this link
 * @returns {string} The new relationship ID
 */
function addNewLinkRelationship(params, link) {
  const newId = 'rId' + generateDocxRandomId();

  if (!params.relationships || !Array.isArray(params.relationships)) {
    params.relationships = [];
  }

  params.relationships.push({
    type: 'element',
    name: 'Relationship',
    attributes: {
      Id: newId,
      Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',
      Target: link,
      TargetMode: 'External',
    },
  });

  return newId;
}

/**
 * Create a new image relationship and add it to the relationships array
 *
 * @param {ExportParams} params
 * @param {string} imagePath The path to the image
 * @returns {string} The new relationship ID
 */
function addNewImageRelationship(params, imagePath) {
  const newId = 'rId' + generateDocxRandomId();
  const newRel = {
    type: 'element',
    name: 'Relationship',
    attributes: {
      Id: newId,
      Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
      Target: imagePath,
    },
  };
  params.relationships.push(newRel);
  return newId;
}

/**
 * Translate a list node
 *
 * @param {ExportParams} params
 * @returns {XmlReadyNode} The translated list node
 */
function translateList(params) {
  const { node, editor } = params;

  const listItem = node.content[0];
  const { numId, level } = listItem.attrs;
  const listType = node.type.name;
  const listDef = ListHelpers.getListDefinitionDetails({ numId, level, listType, editor });
  if (!listDef) {
    ListHelpers.generateNewListDefinition({
      numId,
      listType,
      editor,
    });
  }

  let numPrTag;

  // These should exist for all imported nodes
  if (numId !== undefined && numId !== null) {
    numPrTag = generateNumPrTag(numId, level);
  }

  // Collapse multiple paragraphs into a single node for this list item
  // In docx we need a single paragraph, but can include line breaks in a run
  const collapsedParagraphNode = convertMultipleListItemsIntoSingleNode(listItem);

  let outputNode = exportSchemaToJson({ ...params, node: collapsedParagraphNode });

  /**
   * MS Word does not allow paragraphs inside lists (which are just paragraphs in OOXML)
   * So we need to turn paragraphs into runs and add line breaks
   *
   * Two cases:
   *  1. Final doc (keep paragraph field content inside list item)
   *  2. Not final doc (keep w:sdt node, process its content)
   */
  if (Array.isArray(outputNode) && params.isFinalDoc) {
    const parsedElements = [];
    outputNode?.forEach((node, index) => {
      if (node?.elements) {
        const runs = node.elements?.filter((n) => n.name === 'w:r');
        parsedElements.push(...runs);

        if (node.name === 'w:p' && index < outputNode.length - 1) {
          parsedElements.push({
            name: 'w:br',
          });
        }
      }
    });

    outputNode = {
      name: 'w:p',
      elements: [{ name: 'w:pPr', elements: [] }, ...parsedElements],
    };
  }

  /** Case 2: Process w:sdt content */
  let nodesToFlatten = [];
  const sdtNodes = outputNode.elements?.filter((n) => n.name === 'w:sdt');
  if (sdtNodes && sdtNodes.length > 0) {
    nodesToFlatten = sdtNodes;
    nodesToFlatten?.forEach((sdtNode) => {
      const sdtContent = sdtNode.elements.find((n) => n.name === 'w:sdtContent');
      const foundRun = sdtContent.elements?.find((el) => el.name === 'w:r'); // this is a regular text field.
      if (sdtContent && sdtContent.elements && !foundRun) {
        const parsedElements = [];
        sdtContent.elements.forEach((element, index) => {
          if (element.name === 'w:rPr' && element.elements?.length) {
            parsedElements.push(element);
          }

          const runs = element.elements?.filter((n) => n.name === 'w:r');
          if (runs && runs.length) {
            parsedElements.push(...runs);
          }

          if (element.name === 'w:p' && index < sdtContent.elements.length - 1) {
            parsedElements.push({
              name: 'w:br',
            });
          }
        });
        sdtContent.elements = parsedElements;
      }
    });
  }

  const pPr = outputNode.elements?.find((n) => n.name === 'w:pPr');
  if (pPr && pPr.elements && numPrTag) {
    pPr.elements.unshift(numPrTag);
  }

  const indentTag = restoreIndent(listItem.attrs.indent);
  indentTag && pPr?.elements?.push(indentTag);

  const runNode = outputNode.elements?.find((n) => n.name === 'w:r');
  const rPr = runNode?.elements?.find((n) => n.name === 'w:rPr');
  if (rPr) pPr.elements.push(rPr);

  if (listItem.attrs.numPrType !== 'inline') {
    const numPrIndex = pPr?.elements?.findIndex((e) => e?.name === 'w:numPr');
    if (numPrIndex !== -1) {
      pPr?.elements?.splice(numPrIndex, 1);
    }
  }

  return [outputNode];
}

/**
 * Convert multiple list items into a single paragraph node
 * This is necessary because in docx, a list item can only have one paragraph,
 * but in PM, a list item can have multiple paragraphs.
 * @param {SchemaNode} listItem The list item node to convert
 * @returns {XmlReadyNode|null} The collapsed paragraph node or null if no content
 */
const convertMultipleListItemsIntoSingleNode = (listItem) => {
  const { content } = listItem;

  if (!content || content.length === 0) {
    return null;
  }

  const firstParagraph = content[0];
  const collapsedParagraph = {
    ...firstParagraph,
    content: [],
  };

  // Collapse all paragraphs into a single paragraph node
  content.forEach((item, index) => {
    if (item.type === 'paragraph') {
      if (index > 0) {
        collapsedParagraph.content.push({
          type: 'lineBreak',
          attrs: {},
          content: [],
        });
      }

      // Add all text nodes and other content directly from this paragraph
      if (item.content && item.content.length > 0) {
        collapsedParagraph.content.push(...item.content);
      }
    } else {
      // For non-paragraph items, add them directly
      collapsedParagraph.content.push(item);
    }
  });

  return collapsedParagraph;
};

const restoreIndent = (indent) => {
  const attributes = {};
  if (!indent) indent = {};
  if (indent.left || indent.left === 0) attributes['w:left'] = pixelsToTwips(indent.left);
  if (indent.right || indent.right === 0) attributes['w:right'] = pixelsToTwips(indent.right);
  if (indent.firstLine || indent.firstLine === 0) attributes['w:firstLine'] = pixelsToTwips(indent.firstLine);
  if (indent.hanging || indent.hanging === 0) attributes['w:hanging'] = pixelsToTwips(indent.hanging);
  if (indent.leftChars || indent.leftChars === 0) attributes['w:leftChars'] = pixelsToTwips(indent.leftChars);

  if (!Object.keys(attributes).length) return;

  return {
    name: 'w:ind',
    type: 'element',
    attributes,
  };
};

const generateNumPrTag = (numId, level) => {
  return {
    name: 'w:numPr',
    type: 'element',
    elements: [
      {
        name: 'w:numId',
        type: 'element',
        attributes: { 'w:val': numId },
      },
      {
        name: 'w:ilvl',
        type: 'element',
        attributes: { 'w:val': level },
      },
    ],
  };
};

/**
 * Translate a line break node
 *
 * @param {ExportParams} params
 * @returns {XmlReadyNode}
 */
function translateLineBreak(params) {
  const attributes = {};

  const { lineBreakType } = params.node?.attrs || {};
  if (lineBreakType) {
    attributes['w:type'] = lineBreakType;
  }

  return {
    name: 'w:r',
    elements: [
      {
        name: 'w:br',
        attributes,
      },
    ],
    attributes,
  };
}

/**
 * Translate a table node
 *
 * @param {ExportParams} params The table node to translate
 * @returns {XmlReadyNode} The translated table node
 */
function translateTable(params) {
  params.node = preProcessVerticalMergeCells(params.node, params);
  const elements = translateChildNodes(params);
  const tableProperties = generateTableProperties(params.node);
  const gridProperties = generateTableGrid(params.node, params);

  elements.unshift(tableProperties);
  elements.unshift(gridProperties);
  return {
    name: 'w:tbl',
    elements,
  };
}

/**
 * Restore vertically merged cells from a table
 * @param {ExportParams.node} table The table node
 * @returns {ExportParams.node} The table node with merged cells restored
 */
function preProcessVerticalMergeCells(table, { editorSchema }) {
  const { content } = table;
  for (let rowIndex = 0; rowIndex < content.length; rowIndex++) {
    const row = content[rowIndex];
    if (!row.content) continue;
    for (let cellIndex = 0; cellIndex < row.content?.length; cellIndex++) {
      const cell = row.content[cellIndex];
      if (!cell) continue;

      const { attrs } = cell;
      if (attrs.rowspan > 1) {
        // const { mergedCells } = attrs;
        const rowsToChange = content.slice(rowIndex + 1, rowIndex + attrs.rowspan);
        const mergedCell = {
          type: cell.type,
          content: [
            // cells must end with a paragraph
            editorSchema.nodes.paragraph.createAndFill().toJSON(),
          ],
          attrs: {
            ...cell.attrs,
            // reset colspan and rowspan
            colspan: null,
            rowspan: null,
            // to add vMerge
            continueMerge: true,
          },
        };

        rowsToChange.forEach((rowToChange) => {
          rowToChange.content.splice(cellIndex, 0, mergedCell);
        });
      }
    }
  }
  return table;
}

function translateTab(params) {
  const { marks = [] } = params.node;

  const outputMarks = processOutputMarks(marks);
  const tabNode = {
    name: 'w:tab',
  };

  return wrapTextInRun(tabNode, outputMarks);
}

/**
 * Generate w:tblPr properties node for a table
 *
 * @param {SchemaNode} node
 * @returns {XmlReadyNode} The table properties node
 */
function generateTableProperties(node) {
  const elements = [];

  const { attrs } = node;
  const { tableWidth, tableStyleId, borders, tableIndent, tableLayout, tableCellSpacing, justification } = attrs;

  if (tableStyleId) {
    const tableStyleElement = {
      name: 'w:tblStyle',
      attributes: { 'w:val': tableStyleId },
    };
    elements.push(tableStyleElement);
  }

  if (borders) {
    const borderElement = generateTableBorders(node);
    elements.push(borderElement);
  }

  if (tableIndent) {
    const { width, type } = tableIndent;
    const tableIndentElement = {
      name: 'w:tblInd',
      attributes: { 'w:w': pixelsToTwips(width), 'w:type': type },
    };
    elements.push(tableIndentElement);
  }

  if (tableLayout) {
    const tableLayoutElement = {
      name: 'w:tblLayout',
      attributes: { 'w:type': tableLayout },
    };
    elements.push(tableLayoutElement);
  }

  if (tableWidth && tableWidth.width) {
    const tableWidthElement = {
      name: 'w:tblW',
      attributes: { 'w:w': pixelsToTwips(tableWidth.width), 'w:type': tableWidth.type },
    };
    elements.push(tableWidthElement);
  }

  if (tableCellSpacing) {
    elements.push({
      name: 'w:tblCellSpacing',
      attributes: {
        'w:w': tableCellSpacing.w,
        'w:type': tableCellSpacing.type,
      },
    });
  }

  if (justification) {
    const justificationElement = {
      name: 'w:jc',
      attributes: { 'w:val': justification },
    };
    elements.push(justificationElement);
  }

  return {
    name: 'w:tblPr',
    elements,
  };
}

/**
 * Generate w:tblBorders properties node for a table
 *
 * @param {SchemaNode} node
 * @returns {XmlReadyNode} The table borders properties node
 */
function generateTableBorders(node) {
  const { borders } = node.attrs;
  const elements = [];

  if (!borders) return;

  const borderTypes = ['top', 'bottom', 'left', 'right', 'insideH', 'insideV'];
  borderTypes.forEach((type) => {
    const border = borders[type];
    if (!border) return;

    let attributes = {};
    if (!Object.keys(border).length || !border.size) {
      attributes = {
        'w:val': 'nil',
      };
    } else {
      attributes = {
        'w:val': 'single',
        'w:sz': pixelsToEightPoints(border.size),
        'w:space': border.space || 0,
        'w:color': border?.color?.substring(1) || '000000',
      };
    }

    const borderElement = {
      name: `w:${type}`,
      attributes,
    };
    elements.push(borderElement);
  });

  return {
    name: 'w:tblBorders',
    elements,
  };
}

/**
 * Generate w:tblGrid properties node for a table
 *
 * @param {SchemaNode} node
 * @returns {XmlReadyNode} The table grid properties node
 */
function generateTableGrid(node, params) {
  const { editorSchema } = params;

  let colgroup = [];

  try {
    const pmNode = editorSchema.nodeFromJSON(node);
    const cellMinWidth = 10;
    const { colgroupValues } = createColGroup(pmNode, cellMinWidth);

    colgroup = colgroupValues;
  } catch {
    colgroup = [];
  }

  const elements = [];
  colgroup?.forEach((width) => {
    elements.push({
      name: 'w:gridCol',
      attributes: { 'w:w': pixelsToTwips(width) },
    });
  });

  return {
    name: 'w:tblGrid',
    elements,
  };
}

/**
 * Main translation function for a table row
 *
 * @param {ExportParams} params
 * @returns {XmlReadyNode} The translated table row node
 */
function translateTableRow(params) {
  const elements = translateChildNodes(params);
  const tableRowProperties = generateTableRowProperties(params.node);
  if (tableRowProperties.elements.length) elements.unshift(tableRowProperties);

  return {
    name: 'w:tr',
    elements,
  };
}

function generateTableRowProperties(node) {
  const { attrs } = node;
  const elements = [];

  const { rowHeight, rowHeightType } = attrs;
  if (rowHeight) {
    const attributes = { 'w:val': pixelsToTwips(rowHeight) };
    if (rowHeightType) attributes['w:hRule'] = rowHeightType;

    const rowHeightElement = {
      name: 'w:trHeight',
      attributes,
    };
    elements.push(rowHeightElement);
  }

  return {
    name: 'w:trPr',
    elements,
  };
}

/**
 * Main translation function for a table cell
 *
 * @param {ExportParams} params
 * @returns {XmlReadyNode} The translated table cell node
 */
function translateTableCell(params) {
  const elements = translateChildNodes({
    ...params,
    tableCell: params.node,
  });

  const cellProps = generateTableCellProperties(params.node);

  elements.unshift(cellProps);
  return {
    name: 'w:tc',
    elements,
  };
}

/**
 * Generate w:tcPr properties node for a table cell
 *
 * @param {SchemaNode} node
 * @returns {XmlReadyNode} The table cell properties node
 */
function generateTableCellProperties(node) {
  const elements = [];

  const { attrs } = node;
  const { colwidth = [], cellWidthType = 'dxa', background = {}, colspan, rowspan, widthUnit } = attrs;
  const colwidthSum = colwidth.reduce((acc, curr) => acc + curr, 0);

  const cellWidthElement = {
    name: 'w:tcW',
    attributes: {
      'w:w': widthUnit === 'px' ? pixelsToTwips(colwidthSum) : inchesToTwips(colwidthSum),
      'w:type': cellWidthType,
    },
  };
  elements.push(cellWidthElement);

  if (colspan) {
    const gridSpanElement = {
      name: 'w:gridSpan',
      attributes: { 'w:val': `${colspan}` },
    };
    elements.push(gridSpanElement);
  }

  const { color } = background || {};
  if (color) {
    const cellBgElement = {
      name: 'w:shd',
      attributes: { 'w:fill': color },
    };
    elements.push(cellBgElement);
  }

  const { cellMargins } = attrs;
  if (cellMargins) {
    const cellMarginsElement = {
      name: 'w:tcMar',
      elements: generateCellMargins(cellMargins),
    };
    elements.push(cellMarginsElement);
  }

  const { verticalAlign } = attrs;
  if (verticalAlign) {
    const vertAlignElement = {
      name: 'w:vAlign',
      attributes: { 'w:val': verticalAlign },
    };
    elements.push(vertAlignElement);
  }

  // const { vMerge } = attrs;
  // if (vMerge) {}
  if (rowspan && rowspan > 1) {
    const vMergeElement = {
      name: 'w:vMerge',
      type: 'element',
      attributes: { 'w:val': 'restart' },
    };
    elements.push(vMergeElement);
  } else if (attrs.continueMerge) {
    const vMergeElement = {
      name: 'w:vMerge',
      type: 'element',
    };
    elements.push(vMergeElement);
  }

  const { borders = {} } = attrs;
  if (!!borders && Object.keys(borders).length) {
    const cellBordersElement = {
      name: 'w:tcBorders',
      elements: Object.entries(borders).map(([key, value]) => {
        if (!value.size || value.val === 'none') {
          return {
            name: `w:${key}`,
            attributes: {
              'w:val': 'nil',
            },
          };
        }
        return {
          name: `w:${key}`,
          attributes: {
            'w:val': 'single',
            'w:color': value.color ? value.color.substring(1) : 'auto',
            'w:sz': pixelsToEightPoints(value.size),
            'w:space': value.space || 0,
          },
        };
      }),
    };

    elements.push(cellBordersElement);
  }

  return {
    name: 'w:tcPr',
    elements,
  };
}

function generateCellMargins(cellMargins) {
  const elements = [];
  const { top, right, bottom, left } = cellMargins;
  if (top != null) elements.push({ name: 'w:top', attributes: { 'w:w': pixelsToTwips(top) } });
  if (right != null) elements.push({ name: 'w:right', attributes: { 'w:w': pixelsToTwips(right) } });
  if (bottom != null) elements.push({ name: 'w:bottom', attributes: { 'w:w': pixelsToTwips(bottom) } });
  if (left != null) elements.push({ name: 'w:left', attributes: { 'w:w': pixelsToTwips(left) } });
  return elements;
}

/**
 * Translate bookmark start node. We don't maintain an internal 'end' node since its normal
 * to place it right next to the start. We export both here.
 *
 * @param {ExportParams} params
 * @returns {XmlReadyNode} The translated bookmark node
 */
function translateBookmarkStart(params) {
  const bookmarkStartNode = {
    name: 'w:bookmarkStart',
    attributes: {
      'w:id': params.node.attrs.id,
      'w:name': params.node.attrs.name,
    },
  };
  const bookmarkEndNode = {
    name: 'w:bookmarkEnd',
    attributes: {
      'w:id': params.node.attrs.id,
    },
  };
  return [bookmarkStartNode, bookmarkEndNode];
}

/**
 * Translate a mark to an XML ready attribute
 *
 * @param {MarkType} mark
 * @returns {Object} The XML ready mark attribute
 */
function translateMark(mark) {
  const xmlMark = SuperConverter.markTypes.find((m) => m.type === mark.type);
  if (!xmlMark) {
    // TODO: Telemetry
    return {};
  }

  const markElement = { name: xmlMark.name, attributes: {} };

  const { attrs } = mark;
  let value;

  switch (mark.type) {
    case 'bold':
      if (attrs?.value) {
        markElement.attributes['w:val'] = attrs.value;
      } else {
        delete markElement.attributes;
      }
      markElement.type = 'element';
      break;

    case 'italic':
      delete markElement.attributes;
      markElement.type = 'element';
      break;

    case 'underline':
      markElement.type = 'element';
      markElement.attributes['w:val'] = attrs.underlineType;
      break;

    // Text style cases
    case 'fontSize':
      value = attrs.fontSize;
      markElement.attributes['w:val'] = value.slice(0, -2) * 2; // Convert to half-points
      break;

    case 'fontFamily':
      value = attrs.fontFamily;
      ['w:ascii', 'w:eastAsia', 'w:hAnsi', 'w:cs'].forEach((attr) => {
        const parsedValue = value.split(', ');
        markElement.attributes[attr] = parsedValue[0] ? parsedValue[0] : value;
      });
      break;

    // Add ability to get run styleIds from textStyle marks and inject to run properties in word
    case 'styleId':
      markElement.name = 'w:rStyle';
      markElement.attributes['w:val'] = attrs.styleId;
      break;

    case 'color':
      let processedColor = attrs.color.replace(/^#/, '').replace(/;$/, ''); // Remove `#` and `;` if present
      if (processedColor.startsWith('rgb')) {
        processedColor = rgbToHex(processedColor);
      }
      markElement.attributes['w:val'] = processedColor;
      break;

    case 'textAlign':
      markElement.attributes['w:val'] = attrs.textAlign;
      break;

    case 'textIndent':
      markElement.attributes['w:firstline'] = inchesToTwips(attrs.textIndent);
      break;

    case 'textTransform':
      if (attrs?.textTransform === 'none') {
        markElement.attributes['w:val'] = '0';
      } else {
        delete markElement.attributes;
      }
      markElement.type = 'element';
      break;

    case 'lineHeight':
      markElement.attributes['w:line'] = linesToTwips(attrs.lineHeight);
      break;
    case 'highlight':
      markElement.attributes['w:fill'] = attrs.color?.substring(1);
      markElement.attributes['w:color'] = 'auto';
      markElement.attributes['w:val'] = 'clear';
      markElement.name = 'w:shd';
      break;

    case 'link':
      break;
  }

  return markElement;
}

function getPngDimensions(base64) {
  if (!base64) return {};

  const type = base64.split(';')[0].split('/')[1];
  if (!base64 || type !== 'png') {
    return {
      originalWidth: undefined,
      originalHeight: undefined,
    };
  }

  let header = base64.split(',')[1].slice(0, 50);
  let uint8 = Uint8Array.from(atob(header), (c) => c.charCodeAt(0));
  let dataView = new DataView(uint8.buffer, 0, 28);

  return {
    originalWidth: dataView.getInt32(16),
    originalHeight: dataView.getInt32(20),
  };
}

function getScaledSize(originalWidth, originalHeight, maxWidth, maxHeight) {
  let scaledWidth = originalWidth;
  let scaledHeight = originalHeight;

  // Calculate aspect ratio
  let ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);

  // Scale dimensions
  scaledWidth = Math.round(scaledWidth * ratio);
  scaledHeight = Math.round(scaledHeight * ratio);

  return { scaledWidth, scaledHeight };
}

function translateImageNode(params, imageSize) {
  const {
    node: { attrs = {} },
    tableCell,
  } = params;

  let imageId = attrs.rId;

  const src = attrs.src || attrs.imageSrc;
  const { originalWidth, originalHeight } = getPngDimensions(src);
  const imageName = params.node.type === 'image' ? src?.split('word/media/')[1] : attrs.fieldId?.replace('-', '_');

  let size = attrs.size
    ? {
        w: pixelsToEmu(attrs.size.width),
        h: pixelsToEmu(attrs.size.height),
      }
    : imageSize;

  if (originalWidth && originalHeight) {
    const boxWidthPx = emuToPixels(size.w);
    const boxHeightPx = emuToPixels(size.h);
    const { scaledWidth, scaledHeight } = getScaledSize(originalWidth, originalHeight, boxWidthPx, boxHeightPx);
    size = {
      w: pixelsToEmu(scaledWidth),
      h: pixelsToEmu(scaledHeight),
    };
  }

  if (tableCell) {
    // Image inside tableCell
    const colwidthSum = tableCell.attrs.colwidth.reduce((acc, curr) => acc + curr, 0);
    const leftMargin = tableCell.attrs.cellMargins?.left || 8;
    const rightMargin = tableCell.attrs.cellMargins?.right || 8;
    const maxWidthEmu = pixelsToEmu(colwidthSum - (leftMargin + rightMargin));
    const { width: w, height: h } = resizeKeepAspectRatio(size.w, size.h, maxWidthEmu);
    if (w && h) size = { w, h };
  }

  if (params.node.type === 'image' && !imageId) {
    const path = src?.split('word/')[1];
    imageId = addNewImageRelationship(params, path);
  } else if (params.node.type === 'fieldAnnotation' && !imageId) {
    const type = src?.split(';')[0].split('/')[1];
    if (!type) {
      return prepareTextAnnotation(params);
    }

    const imageUrl = `media/${imageName}_${attrs.hash}.${type}`;
    imageId = addNewImageRelationship(params, imageUrl);
    params.media[`${imageName}_${attrs.hash}.${type}`] = src;
  }

  let inlineAttrs = attrs.originalPadding || {
    distT: 0,
    distB: 0,
    distL: 0,
    distR: 0,
  };

  const anchorElements = [];
  let wrapProp = [];

  // Handle anchor image export
  if (attrs.isAnchor) {
    inlineAttrs = {
      ...inlineAttrs,
      simplePos: attrs.originalAttributes?.simplePos,
      relativeHeight: 1,
      behindDoc: attrs.originalAttributes?.behindDoc,
      locked: attrs.originalAttributes?.locked,
      layoutInCell: attrs.originalAttributes?.layoutInCell,
      allowOverlap: attrs.originalAttributes?.allowOverlap,
    };
    if (attrs.simplePos) {
      anchorElements.push({
        name: 'wp:simplePos',
        attributes: {
          x: 0,
          y: 0,
        },
      });
    }

    if (attrs.anchorData) {
      anchorElements.push({
        name: 'wp:positionH',
        attributes: {
          relativeFrom: attrs.anchorData.hRelativeFrom,
        },
        ...(attrs.marginOffset.left !== undefined && {
          elements: [
            {
              name: 'wp:posOffset',
              elements: [
                {
                  type: 'text',
                  text: pixelsToEmu(attrs.marginOffset.left).toString(),
                },
              ],
            },
          ],
        }),
        ...(attrs.anchorData.alignH && {
          elements: [
            {
              name: 'wp:align',
              elements: [
                {
                  type: 'text',
                  text: attrs.anchorData.alignH,
                },
              ],
            },
          ],
        }),
      });

      anchorElements.push({
        name: 'wp:positionV',
        attributes: {
          relativeFrom: attrs.anchorData.vRelativeFrom,
        },
        ...(attrs.marginOffset.top !== undefined && {
          elements: [
            {
              name: 'wp:posOffset',
              elements: [
                {
                  type: 'text',
                  text: pixelsToEmu(attrs.marginOffset.top).toString(),
                },
              ],
            },
          ],
        }),
        ...(attrs.anchorData.alignV && {
          elements: [
            {
              name: 'wp:align',
              elements: [
                {
                  type: 'text',
                  text: attrs.anchorData.alignV,
                },
              ],
            },
          ],
        }),
      });
    }

    if (attrs.wrapText) {
      wrapProp.push({
        name: 'wp:wrapSquare',
        attributes: {
          wrapText: attrs.wrapText,
        },
      });
    }

    if (attrs.wrapTopAndBottom) {
      wrapProp.push({
        name: 'wp:wrapTopAndBottom',
      });
    }

    // Important: wp:anchor will break if no wrapping is specified. We need to use wrapNone.
    if (attrs.isAnchor && !wrapProp.length) {
      wrapProp.push({
        name: 'wp:wrapNone',
      });
    }
  }

  const drawingXmlns = 'http://schemas.openxmlformats.org/drawingml/2006/main';
  const pictureXmlns = 'http://schemas.openxmlformats.org/drawingml/2006/picture';

  const textNode = wrapTextInRun(
    {
      name: 'w:drawing',
      elements: [
        {
          name: attrs.isAnchor ? 'wp:anchor' : 'wp:inline',
          attributes: inlineAttrs,
          elements: [
            ...anchorElements,
            {
              name: 'wp:extent',
              attributes: {
                cx: size.w,
                cy: size.h,
              },
            },
            {
              name: 'wp:effectExtent',
              attributes: {
                l: 0,
                t: 0,
                r: 0,
                b: 0,
              },
            },
            ...wrapProp,
            {
              name: 'wp:docPr',
              attributes: {
                id: attrs.id || 0,
                name: attrs.alt || `Picture ${imageName}`,
              },
            },
            {
              name: 'wp:cNvGraphicFramePr',
              elements: [
                {
                  name: 'a:graphicFrameLocks',
                  attributes: {
                    'xmlns:a': drawingXmlns,
                    noChangeAspect: 1,
                  },
                },
              ],
            },
            {
              name: 'a:graphic',
              attributes: { 'xmlns:a': drawingXmlns },
              elements: [
                {
                  name: 'a:graphicData',
                  attributes: { uri: pictureXmlns },
                  elements: [
                    {
                      name: 'pic:pic',
                      attributes: { 'xmlns:pic': pictureXmlns },
                      elements: [
                        {
                          name: 'pic:nvPicPr',
                          elements: [
                            {
                              name: 'pic:cNvPr',
                              attributes: {
                                id: attrs.id || 0,
                                name: attrs.title || `Picture ${imageName}`,
                              },
                            },
                            {
                              name: 'pic:cNvPicPr',
                              elements: [
                                {
                                  name: 'a:picLocks',
                                  attributes: {
                                    noChangeAspect: 1,
                                    noChangeArrowheads: 1,
                                  },
                                },
                              ],
                            },
                          ],
                        },
                        {
                          name: 'pic:blipFill',
                          elements: [
                            {
                              name: 'a:blip',
                              attributes: {
                                'r:embed': imageId,
                              },
                            },
                            {
                              name: 'a:stretch',
                              elements: [{ name: 'a:fillRect' }],
                            },
                          ],
                        },
                        {
                          name: 'pic:spPr',
                          attributes: {
                            bwMode: 'auto',
                          },
                          elements: [
                            {
                              name: 'a:xfrm',
                              elements: [
                                {
                                  name: 'a:ext',
                                  attributes: {
                                    cx: size.w,
                                    cy: size.h,
                                  },
                                },
                                {
                                  name: 'a:off',
                                  attributes: {
                                    x: 0,
                                    y: 0,
                                  },
                                },
                              ],
                            },
                            {
                              name: 'a:prstGeom',
                              attributes: { prst: 'rect' },
                              elements: [{ name: 'a:avLst' }],
                            },
                            {
                              name: 'a:noFill',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    [],
  );

  return textNode;
}

/**
 * Translates text annotations
 *
 * @param {ExportParams} params
 * @returns {XmlReadyNode} The translated text node
 */
function prepareTextAnnotation(params) {
  const {
    node: { attrs = {}, marks = [] },
  } = params;

  const marksFromAttrs = translateFieldAttrsToMarks(attrs);
  return getTextNodeForExport(attrs.displayLabel, [...marks, ...marksFromAttrs], params);
}

/**
 * Translates checkbox annotations
 *
 * @param {ExportParams} params
 * @returns {XmlReadyNode} The translated checkbox node
 */
function prepareCheckboxAnnotation(params) {
  const {
    node: { attrs = {}, marks = [] },
  } = params;
  const content = he.decode(attrs.displayLabel);
  return getTextNodeForExport(content, marks, params);
}

/**
 * Translates html annotations
 *
 * @param {ExportParams} params
 * @returns {XmlReadyNode} The translated html node
 */
function prepareHtmlAnnotation(params) {
  const {
    node: { attrs = {}, marks = [] },
    editorSchema,
  } = params;

  let html = attrs.rawHtml || attrs.displayLabel;
  const paragraphHtmlContainer = sanitizeHtml(html);
  const marksFromAttrs = translateFieldAttrsToMarks(attrs);
  const allMarks = [...marks, ...marksFromAttrs];

  let state = EditorState.create({
    doc: PMDOMParser.fromSchema(editorSchema).parse(paragraphHtmlContainer),
  });

  if (allMarks.length) {
    state = applyMarksToHtmlAnnotation(state, allMarks);
  }

  const htmlAnnotationNode = state.doc.toJSON();
  const listTypes = ['bulletList', 'orderedList'];
  const { editor } = params;
  const seenLists = new Map();
  state.doc.descendants((node) => {
    if (listTypes.includes(node.type.name)) {
      const listItem = node.firstChild;
      const { attrs } = listItem;
      const { level, numId } = attrs;
      if (!seenLists.has(numId)) {
        const newNumId = ListHelpers.changeNumIdSameAbstract(numId, level, node.type.name, editor);
        listItem.attrs.numId = newNumId;
        seenLists.set(numId, newNumId);
      } else {
        const newNumId = seenLists.get(numId);
        listItem.attrs.numId = newNumId;
      }
    }
  });

  const elements = translateChildNodes({
    ...params,
    node: htmlAnnotationNode,
  });

  return {
    name: 'htmlAnnotation',
    elements,
  };
}

/**
 * Translates image annotations
 * @param {ExportParams} params
 * @param {Object} imageSize Object contains width and height for image in EMU
 * @returns {XmlReadyNode} The translated image node
 */
function prepareImageAnnotation(params, imageSize) {
  return translateImageNode(params, imageSize);
}

/**
 * Translates URL annotations
 *
 * @param {ExportParams} params
 * @returns {XmlReadyNode} The translated URL node
 */
function prepareUrlAnnotation(params) {
  const {
    node: { attrs = {}, marks = [] },
  } = params;
  const newId = addNewLinkRelationship(params, attrs.linkUrl);

  const linkTextNode = getTextNodeForExport(attrs.linkUrl, marks, params);
  const contentNode = processLinkContentNode(linkTextNode);

  return {
    name: 'w:hyperlink',
    type: 'element',
    attributes: {
      'r:id': newId,
      'w:history': 1,
    },
    elements: [contentNode],
  };
}

/**
 * Returns node handler based on annotation type
 *
 * @param {String} annotationType
 * @returns {Function} handler for provided annotation type
 */
function getTranslationByAnnotationType(annotationType, annotationFieldType) {
  // invalid annotation
  if (annotationType === 'text' && annotationFieldType === 'FILEUPLOADER') {
    return null;
  }

  const imageEmuSize = {
    w: 4286250,
    h: 4286250,
  };

  const signatureEmuSize = {
    w: 990000,
    h: 495000,
  };

  const dictionary = {
    text: prepareTextAnnotation,
    image: (params) => prepareImageAnnotation(params, imageEmuSize),
    signature: (params) => prepareImageAnnotation(params, signatureEmuSize),
    checkbox: prepareCheckboxAnnotation,
    html: prepareHtmlAnnotation,
    link: prepareUrlAnnotation,
  };

  return dictionary[annotationType];
}

const translateFieldAttrsToMarks = (attrs = {}) => {
  const { fontFamily, fontSize, bold, underline, italic, textColor, textHighlight } = attrs;

  const marks = [];
  if (fontFamily) marks.push({ type: 'fontFamily', attrs: { fontFamily } });
  if (fontSize) marks.push({ type: 'fontSize', attrs: { fontSize } });
  if (bold) marks.push({ type: 'bold', attrs: {} });
  if (underline) marks.push({ type: 'underline', attrs: {} });
  if (italic) marks.push({ type: 'italic', attrs: {} });
  if (textColor) marks.push({ type: 'color', attrs: { color: textColor } });
  if (textHighlight) marks.push({ type: 'highlight', attrs: { color: textHighlight } });
  return marks;
};

/**
 * Translate a field annotation node
 *
 * @param {ExportParams} params
 * @returns {XmlReadyNode} The translated field annotation node
 */
function translateFieldAnnotation(params) {
  const { node, isFinalDoc, fieldsHighlightColor } = params;
  const { attrs = {} } = node;
  const annotationHandler = getTranslationByAnnotationType(attrs.type, attrs.fieldType);
  if (!annotationHandler) return {};

  let processedNode;
  let sdtContentElements;

  if ((attrs.type === 'image' || attrs.type === 'signature') && !attrs.hash) {
    attrs.hash = generateDocxRandomId(4);
  }

  if (isFinalDoc) {
    return annotationHandler(params);
  } else {
    processedNode = annotationHandler(params);
    sdtContentElements = [processedNode];

    if (attrs.type === 'html') {
      sdtContentElements = [...processedNode.elements];
    }
  }

  sdtContentElements = [...sdtContentElements];

  // Set field background color only if param is provided, default to transparent
  const fieldBackgroundTag = getFieldHighlightJson(fieldsHighlightColor);
  if (fieldBackgroundTag) {
    sdtContentElements.unshift(fieldBackgroundTag);
  }

  // Contains only the main attributes.
  const annotationAttrs = {
    displayLabel: attrs.displayLabel,
    defaultDisplayLabel: attrs.defaultDisplayLabel,
    fieldId: attrs.fieldId,
    fieldType: attrs.fieldType,
    fieldTypeShort: attrs.type,
    fieldColor: attrs.fieldColor,
    fieldMultipleImage: attrs.multipleImage,
    fieldFontFamily: attrs.fontFamily,
    fieldFontSize: attrs.fontSize,
    fieldTextColor: attrs.textColor,
    fieldTextHighlight: attrs.textHighlight,
    hash: attrs.hash,
  };
  const annotationAttrsJson = JSON.stringify(annotationAttrs);

  const result = {
    name: 'w:sdt',
    elements: [
      {
        name: 'w:sdtPr',
        elements: [
          { name: 'w:tag', attributes: { 'w:val': annotationAttrsJson } },
          { name: 'w:alias', attributes: { 'w:val': attrs.displayLabel } },
        ],
      },
      {
        name: 'w:sdtContent',
        elements: sdtContentElements,
      },
    ],
  };
  return result;
}

export function translateHardBreak(params) {
  const { node = {} } = params;
  const { attrs = {} } = node;
  const { pageBreakSource } = attrs;
  if (pageBreakSource === 'sectPr') return null;

  return {
    name: 'w:r',
    elements: [
      {
        name: 'w:br',
        type: 'element',
        attributes: { 'w:type': 'page' },
      },
    ],
  };
}

function translateShapeContainer(params) {
  const { node } = params;
  const elements = translateChildNodes(params);

  const shape = {
    name: 'v:shape',
    attributes: {
      ...node.attrs.attributes,
      fillcolor: node.attrs.fillcolor,
    },
    elements: [
      ...elements,
      ...(node.attrs.wrapAttributes
        ? [
            {
              name: 'w10:wrap',
              attributes: { ...node.attrs.wrapAttributes },
            },
          ]
        : []),
    ],
  };

  const pict = {
    name: 'w:pict',
    attributes: {
      'w14:anchorId': Math.floor(Math.random() * 0xffffffff).toString(),
    },
    elements: [shape],
  };

  const par = {
    name: 'w:p',
    elements: [wrapTextInRun(pict)],
  };

  return par;
}

function translateShapeTextbox(params) {
  const { node } = params;
  const elements = translateChildNodes(params);

  const textboxContent = {
    name: 'w:txbxContent',
    elements,
  };

  const textbox = {
    name: 'v:textbox',
    attributes: {
      ...node.attrs.attributes,
    },
    elements: [textboxContent],
  };

  return textbox;
}

function translateContentBlock(params) {
  const { node } = params;
  const { drawingContent, vmlAttributes, horizontalRule } = node.attrs;

  // Handle VML v:rect elements (like horizontal rules)
  if (vmlAttributes || horizontalRule) {
    return translateVRectContentBlock(params);
  }

  // Handle modern DrawingML content (existing logic)
  const drawing = {
    name: 'w:drawing',
    elements: [...(drawingContent ? [...(drawingContent.elements || [])] : [])],
  };

  const choice = {
    name: 'mc:Choice',
    attributes: { Requires: 'wps' },
    elements: [drawing],
  };

  const alternateContent = {
    name: 'mc:AlternateContent',
    elements: [choice],
  };

  return wrapTextInRun(alternateContent);
}

function translateVRectContentBlock(params) {
  const { node } = params;
  const { vmlAttributes, background, attributes, style } = node.attrs;

  const rectAttrs = {
    id: attributes?.id || `_x0000_i${Math.floor(Math.random() * 10000)}`,
  };

  if (style) {
    rectAttrs.style = style;
  }

  if (background) {
    rectAttrs.fillcolor = background;
  }

  if (vmlAttributes) {
    if (vmlAttributes.hralign) rectAttrs['o:hralign'] = vmlAttributes.hralign;
    if (vmlAttributes.hrstd) rectAttrs['o:hrstd'] = vmlAttributes.hrstd;
    if (vmlAttributes.hr) rectAttrs['o:hr'] = vmlAttributes.hr;
    if (vmlAttributes.stroked) rectAttrs.stroked = vmlAttributes.stroked;
  }

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (!rectAttrs[key] && value !== undefined) {
        rectAttrs[key] = value;
      }
    });
  }

  // Create the v:rect element
  const rect = {
    name: 'v:rect',
    attributes: rectAttrs,
  };

  // Wrap in w:pict
  const pict = {
    name: 'w:pict',
    attributes: {
      'w14:anchorId': Math.floor(Math.random() * 0xffffffff).toString(),
    },
    elements: [rect],
  };

  return wrapTextInRun(pict);
}

export class DocxExporter {
  constructor(converter) {
    this.converter = converter;
  }

  schemaToXml(data, debug = false) {
    const result = this.#generate_xml_as_list(data, debug);
    return result.join('');
  }

  #generate_xml_as_list(data, debug = false) {
    const json = JSON.parse(JSON.stringify(data));
    const declaration = this.converter.declaration.attributes;
    const xmlTag = `<?xml${Object.entries(declaration)
      .map(([key, value]) => ` ${key}="${value}"`)
      .join('')}?>`;
    const result = this.#generateXml(json, debug);
    const final = [xmlTag, ...result];
    return final;
  }

  #replaceSpecialCharacters(text) {
    if (!text) return;
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  #generateXml(node) {
    if (!node) return null;
    let { name } = node;
    const { elements, attributes } = node;

    let tag = `<${name}`;

    for (let attr in attributes) {
      const parsedAttrName =
        typeof attributes[attr] === 'string' ? this.#replaceSpecialCharacters(attributes[attr]) : attributes[attr];
      tag += ` ${attr}="${parsedAttrName}"`;
    }

    const selfClosing = name && (!elements || !elements.length);
    if (selfClosing) tag += ' />';
    else tag += '>';
    let tags = [tag];

    if (!name && node.type === 'text') {
      return node.text;
    }

    if (elements) {
      if (name === 'w:instrText') {
        tags.push(elements[0].text);
      } else if (name === 'w:t' || name === 'w:delText' || name === 'wp:posOffset') {
        try {
          // test for valid string
          let text = String(elements[0].text);
          text = this.#replaceSpecialCharacters(text);
          tags.push(text);
        } catch (error) {
          console.error('Text element does not contain valid string:', error);
        }
      } else {
        if (elements) {
          for (let child of elements) {
            const newElements = this.#generateXml(child);
            if (!newElements) continue;

            if (typeof newElements === 'string') {
              tags.push(newElements);
              continue;
            }

            const removeUndefined = newElements.filter((el) => {
              return el !== '<undefined>' && el !== '</undefined>';
            });

            tags.push(...removeUndefined);
          }
        }
      }
    }

    if (!selfClosing) tags.push(`</${name}>`);
    return tags;
  }
}

function resizeKeepAspectRatio(width, height, maxWidth) {
  if (width > maxWidth) {
    let scale = maxWidth / width;
    let newHeight = Math.round(height * scale);
    return { width: maxWidth, height: newHeight };
  }
  return { width, height };
}

function applyMarksToHtmlAnnotation(state, marks) {
  const { tr, doc, schema } = state;
  const allowedMarks = ['fontFamily', 'fontSize', 'highlight'];

  if (!marks.some((m) => allowedMarks.includes(m.type))) {
    return state;
  }

  const fontFamily = marks.find((m) => m.type === 'fontFamily');
  const fontSize = marks.find((m) => m.type === 'fontSize');
  const highlight = marks.find((m) => m.type === 'highlight');

  const textStyleType = schema.marks.textStyle;
  const highlightType = schema.marks.highlight;

  doc.descendants((node, pos) => {
    if (!node.isText) return;

    const foundTextStyle = node.marks.find((m) => m.type.name === 'textStyle');
    const foundHighlight = node.marks.find((m) => m.type.name === 'highlight');

    // text style (fontFamily, fontSize)
    if (!foundTextStyle) {
      tr.addMark(
        pos,
        pos + node.nodeSize,
        textStyleType.create({
          ...fontFamily?.attrs,
          ...fontSize?.attrs,
        }),
      );
    } else if (!foundTextStyle?.attrs.fontFamily && fontFamily) {
      tr.addMark(
        pos,
        pos + node.nodeSize,
        textStyleType.create({
          ...foundTextStyle?.attrs,
          ...fontFamily.attrs,
        }),
      );
    } else if (!foundTextStyle?.attrs.fontSize && fontSize) {
      tr.addMark(
        pos,
        pos + node.nodeSize,
        textStyleType.create({
          ...foundTextStyle?.attrs,
          ...fontSize.attrs,
        }),
      );
    }

    // highlight
    if (!foundHighlight) {
      tr.addMark(
        pos,
        pos + node.nodeSize,
        highlightType.create({
          ...highlight?.attrs,
        }),
      );
    }
  });

  return state.apply(tr);
}

function translateStructuredContent(params) {
  const { node } = params;
  const { attrs = {} } = node;

  const childContent = translateChildNodes({ ...params, nodes: node.content });

  // We build the sdt node elements here, and re-add passthrough sdtPr node
  const nodeElements = [
    {
      name: 'w:sdtContent',
      elements: childContent,
    },
  ];
  nodeElements.unshift(attrs.sdtPr);

  return {
    name: 'w:sdt',
    elements: nodeElements,
  };
}

const translatePageNumberNode = (params) => {
  const outputMarks = processOutputMarks(params.node.attrs?.marksAsAttrs || []);
  return getAutoPageJson('PAGE', outputMarks);
};

const translateTotalPageNumberNode = (params) => {
  const outputMarks = processOutputMarks(params.node.attrs?.marksAsAttrs || []);
  return getAutoPageJson('NUMPAGES', outputMarks);
};

const getAutoPageJson = (type, outputMarks = []) => {
  return [
    {
      name: 'w:r',
      elements: [
        {
          name: 'w:rPr',
          elements: outputMarks,
        },
        {
          name: 'w:fldChar',
          attributes: {
            'w:fldCharType': 'begin',
          },
        },
      ],
    },
    {
      name: 'w:r',
      elements: [
        {
          name: 'w:rPr',
          elements: outputMarks,
        },
        {
          name: 'w:instrText',
          elements: [
            {
              type: 'text',
              text: ` ${type}`,
            },
          ],
        },
      ],
    },
    {
      name: 'w:r',
      elements: [
        {
          name: 'w:rPr',
          elements: outputMarks,
        },
        {
          name: 'w:fldChar',
          attributes: {
            'w:fldCharType': 'separate',
          },
        },
      ],
    },
    {
      name: 'w:r',
      elements: [
        {
          name: 'w:rPr',
          elements: outputMarks,
        },
        {
          name: 'w:fldChar',
          attributes: {
            'w:fldCharType': 'end',
          },
        },
      ],
    },
  ];
};

/**
 * Get the JSON representation of the field highlight
 * @param {string} fieldsHighlightColor - The highlight color for the field. Must be valid HEX.
 * @returns {Object} The JSON representation of the field highlight
 */
export const getFieldHighlightJson = (fieldsHighlightColor) => {
  if (!fieldsHighlightColor) return null;

  // Normalize input
  let parsedColor = fieldsHighlightColor.trim();

  // Regex: optional '#' + 3/4/6/8 hex digits
  const hexRegex = /^#?([A-Fa-f0-9]{3}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;

  if (!hexRegex.test(parsedColor)) {
    console.warn(`Invalid HEX color provided to fieldsHighlightColor export param: ${fieldsHighlightColor}`);
    return null;
  }

  // Remove '#' if present
  if (parsedColor.startsWith('#')) {
    parsedColor = parsedColor.slice(1);
  }

  return {
    name: 'w:rPr',
    elements: [
      {
        name: 'w:shd',
        attributes: {
          'w:fill': `#${parsedColor}`,
          'w:color': 'auto',
          'w:val': 'clear',
        },
      },
    ],
  };
};
