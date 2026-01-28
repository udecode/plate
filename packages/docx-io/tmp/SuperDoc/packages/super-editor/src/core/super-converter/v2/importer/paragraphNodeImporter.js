import { twipsToInches, twipsToLines, twipsToPixels, twipsToPt } from '../../helpers.js';
import { carbonCopy } from '../../../utilities/carbonCopy.js';
import { mergeTextNodes } from './mergeTextNodes.js';
import { parseMarks } from './markImporter.js';
import { kebabCase } from '@harbour-enterprises/common';

/**
 * Special cases of w:p based on paragraph properties
 *
 * If we detect a list node, we need to get all nodes that are also lists and process them together
 * in order to combine list item nodes into list nodes.
 *
 * @type {import("docxImporter").NodeHandler}
 */
export const handleParagraphNode = (params) => {
  const { nodes, docx, nodeListHandler, filename } = params;
  if (nodes.length === 0 || nodes[0].name !== 'w:p') {
    return { nodes: [], consumed: 0 };
  }

  const node = carbonCopy(nodes[0]);
  let schemaNode;

  // We need to pre-process paragraph nodes to combine various possible elements we will find ie: lists, links.
  // Also older MS word versions store auto page numbers here
  let processedElements = preProcessNodesForFldChar(node.elements);
  node.elements = processedElements;

  // If it is a standard paragraph node, process normally
  const handleStandardNode = nodeListHandler.handlerEntities.find(
    (e) => e.handlerName === 'standardNodeHandler',
  )?.handler;
  if (!handleStandardNode) {
    console.error('Standard node handler not found');
    return { nodes: [], consumed: 0 };
  }

  const updatedParams = { ...params, nodes: [node] };
  const result = handleStandardNode(updatedParams);
  if (result.nodes.length === 1) {
    schemaNode = result.nodes[0];
  }

  const pPr = node.elements?.find((el) => el.name === 'w:pPr');
  const styleTag = pPr?.elements?.find((el) => el.name === 'w:pStyle');
  const nestedRPr = pPr?.elements?.find((el) => el.name === 'w:rPr');
  const framePr = pPr?.elements?.find((el) => el.name === 'w:framePr');

  if (nestedRPr) {
    let marks = parseMarks(nestedRPr, []);

    if (!schemaNode.content?.length) {
      let highlightIndex = marks?.findIndex((i) => i.type === 'highlight');
      if (highlightIndex !== -1) {
        marks.splice(highlightIndex, 1);
      }
    }

    schemaNode.attrs.marksAttrs = marks;
  }

  let styleId;
  if (styleTag) {
    styleId = styleTag.attributes['w:val'];
    schemaNode.attrs['styleId'] = styleId;
  }

  if (docx) {
    const indent = getParagraphIndent(node, docx, styleId);

    if (!schemaNode.attrs.indent) {
      schemaNode.attrs.indent = {};
    }

    if (indent.left || indent.left === 0) {
      schemaNode.attrs.indent.left = indent.left;
    }
    if (indent.right || indent.right === 0) {
      schemaNode.attrs.indent.right = indent.right;
    }
    if (indent.firstLine || indent.firstLine === 0) {
      schemaNode.attrs.indent.firstLine = indent.firstLine;
    }
    if (indent.hanging || indent.hanging === 0) {
      schemaNode.attrs.indent.hanging = indent.hanging;
    }
    if (indent.textIndent || indent.textIndent === 0) {
      schemaNode.attrs.textIndent = `${indent.textIndent}in`;
    }
  }

  const justify = pPr?.elements?.find((el) => el.name === 'w:jc');
  if (justify && justify.attributes) {
    schemaNode.attrs['textAlign'] = justify.attributes['w:val'];
  }

  const keepLines = pPr?.elements?.find((el) => el.name === 'w:keepLines');
  if (keepLines && keepLines.attributes) {
    schemaNode.attrs['keepLines'] = keepLines.attributes['w:val'];
  }

  const keepNext = pPr?.elements?.find((el) => el.name === 'w:keepNext');
  if (keepNext && keepNext.attributes) {
    schemaNode.attrs['keepNext'] = keepNext.attributes['w:val'];
  }

  if (docx) {
    const defaultStyleId = node.attributes?.['w:rsidRDefault'];
    schemaNode.attrs['spacing'] = getParagraphSpacing(node, docx, styleId, schemaNode.attrs.marksAttrs);
    schemaNode.attrs['rsidRDefault'] = defaultStyleId;
  }

  if (docx) {
    const { justify } = getDefaultParagraphStyle(docx, styleId);
    if (justify) {
      schemaNode.attrs.justify = {
        val: justify['w:val'],
      };
    }
  }

  if (framePr && framePr.attributes['w:dropCap']) {
    schemaNode.attrs.dropcap = {
      type: framePr.attributes['w:dropCap'],
      lines: framePr.attributes['w:lines'],
      wrap: framePr.attributes['w:wrap'],
      hAnchor: framePr.attributes['w:hAnchor'],
      vAnchor: framePr.attributes['w:vAnchor'],
    };
  }

  schemaNode.attrs['filename'] = filename;

  // Parse tab stops
  const tabs = pPr?.elements?.find((el) => el.name === 'w:tabs');
  if (tabs && tabs.elements) {
    const tabStops = tabs.elements
      .filter((el) => el.name === 'w:tab')
      .map((tab) => {
        let val = tab.attributes['w:val'] || 'start';
        // Test files continue to contain "left" and "right" rather than "start" and "end"
        if (val == 'left') {
          val = 'start';
        } else if (val == 'right') {
          val = 'end';
        }
        const tabStop = {
          val,
          pos: twipsToPixels(tab.attributes['w:pos']),
        };

        // Add leader if present
        if (tab.attributes['w:leader']) {
          tabStop.leader = tab.attributes['w:leader'];
        }

        return tabStop;
      });

    if (tabStops.length > 0) {
      schemaNode.attrs.tabStops = tabStops;
    }
  }

  // Normalize text nodes.
  if (schemaNode && schemaNode.content) {
    schemaNode = {
      ...schemaNode,
      content: mergeTextNodes(schemaNode.content),
    };
  }

  // Pass through this paragraph's sectPr, if any
  const sectPr = pPr?.elements?.find((el) => el.name === 'w:sectPr');
  if (sectPr) {
    if (!schemaNode.attrs.paragraphProperties) schemaNode.attrs.paragraphProperties = {};
    schemaNode.attrs.paragraphProperties.sectPr = sectPr;
    schemaNode.attrs.pageBreakSource = 'sectPr';
  }

  return { nodes: schemaNode ? [schemaNode] : [], consumed: 1 };
};

export const getParagraphIndent = (node, docx, styleId = '') => {
  const indent = {
    left: 0,
    right: 0,
    firstLine: 0,
    hanging: 0,
    textIndent: 0,
  };

  const { indent: pDefaultIndent = {} } = getDefaultParagraphStyle(docx, styleId);

  const pPr = node.elements?.find((el) => el.name === 'w:pPr');
  const inLineIndentTag = pPr?.elements?.find((el) => el.name === 'w:ind');
  const inLineIndent = inLineIndentTag?.attributes || {};

  const leftIndent = inLineIndent?.['w:left'] || pDefaultIndent?.['w:left'];
  const rightIndent = inLineIndent?.['w:right'] || pDefaultIndent?.['w:right'];
  const firstLine = inLineIndent?.['w:firstLine'] || pDefaultIndent?.['w:firstLine'];
  const hanging = inLineIndent?.['w:hanging'] || pDefaultIndent?.['w:hanging'];

  if (leftIndent) {
    indent.left = twipsToPixels(leftIndent);
  }
  if (rightIndent) {
    indent.right = twipsToPixels(rightIndent);
  }
  if (firstLine) {
    indent.firstLine = twipsToPixels(firstLine);
  }
  if (hanging) {
    indent.hanging = twipsToPixels(hanging);
  }

  const textIndentValue = leftIndent - parseInt(hanging || 0) || 0;

  if (textIndentValue) {
    indent.textIndent = twipsToInches(textIndentValue);
  }

  return indent;
};

export const getParagraphSpacing = (node, docx, styleId = '', marks = []) => {
  // Check if we have default paragraph styles to override
  const spacing = {};

  const { spacing: pDefaultSpacing = {} } = getDefaultParagraphStyle(docx, styleId);
  let lineSpaceAfter, lineSpaceBefore, line, lineRuleStyle;

  const pPr = node.elements?.find((el) => el.name === 'w:pPr');
  const inLineSpacingTag = pPr?.elements?.find((el) => el.name === 'w:spacing');
  const inLineSpacing = inLineSpacingTag?.attributes || {};

  const textStyleMark = marks.find((el) => el.type === 'textStyle');
  const fontSize = textStyleMark?.attrs?.fontSize;

  // These styles are taken in order of precedence
  // 1. Inline spacing
  // 2. Default style spacing
  // 3. Default paragraph spacing
  const lineSpacing = inLineSpacing?.['w:line'] || line || pDefaultSpacing?.['w:line'];
  if (lineSpacing) spacing.line = twipsToLines(lineSpacing);

  const lineRule = inLineSpacing?.['w:lineRule'] || lineRuleStyle || pDefaultSpacing?.['w:lineRule'];
  if (lineRule) spacing.lineRule = lineRule;

  if (lineRule === 'exact' && lineSpacing) {
    spacing.line = `${twipsToPt(lineSpacing)}pt`;
  }

  const beforeSpacing = inLineSpacing?.['w:before'] || lineSpaceBefore || pDefaultSpacing?.['w:before'];
  if (beforeSpacing) spacing.lineSpaceBefore = twipsToPixels(beforeSpacing);

  const beforeAutospacing = inLineSpacing?.['w:beforeAutospacing'];
  if (beforeAutospacing === '1' && fontSize) {
    spacing.lineSpaceBefore += Math.round((parseInt(fontSize) * 0.5 * 96) / 72);
  }

  const afterSpacing = inLineSpacing?.['w:after'] || lineSpaceAfter || pDefaultSpacing?.['w:after'];
  if (afterSpacing) spacing.lineSpaceAfter = twipsToPixels(afterSpacing);

  const afterAutospacing = inLineSpacing?.['w:afterAutospacing'];
  if (afterAutospacing === '1' && fontSize) {
    spacing.lineSpaceAfter += Math.round((parseInt(fontSize) * 0.5 * 96) / 72);
  }

  return spacing;
};

const getDefaultParagraphStyle = (docx, styleId = '') => {
  const styles = docx['word/styles.xml'];
  if (!styles) {
    return {};
  }
  const defaults = styles.elements[0].elements?.find((el) => el.name === 'w:docDefaults');
  const pDefault = defaults.elements.find((el) => el.name === 'w:pPrDefault');
  const pPrDefault = pDefault?.elements?.find((el) => el.name === 'w:pPr');
  const pPrDefaultSpacingTag = pPrDefault?.elements?.find((el) => el.name === 'w:spacing') || {};
  const pPrDefaultIndentTag = pPrDefault?.elements?.find((el) => el.name === 'w:ind') || {};

  // Paragraph 'Normal' styles
  const stylesNormal = styles.elements[0].elements?.find(
    (el) => el.name === 'w:style' && el.attributes['w:styleId'] === 'Normal',
  );
  const pPrNormal = stylesNormal?.elements?.find((el) => el.name === 'w:pPr');
  const pPrNormalSpacingTag = pPrNormal?.elements?.find((el) => el.name === 'w:spacing') || {};
  const pPrNormalIndentTag = pPrNormal?.elements?.find((el) => el.name === 'w:ind') || {};
  const isNormalAsDefault = stylesNormal?.attributes?.['w:default'] === '1';

  // Styles based on styleId
  let pPrStyleIdSpacingTag = {};
  let pPrStyleIdIndentTag = {};
  let pPrStyleJc = {};
  if (styleId) {
    const stylesById = styles.elements[0].elements?.find(
      (el) => el.name === 'w:style' && el.attributes['w:styleId'] === styleId,
    );
    const pPrById = stylesById?.elements?.find((el) => el.name === 'w:pPr');
    pPrStyleIdSpacingTag = pPrById?.elements?.find((el) => el.name === 'w:spacing') || {};
    pPrStyleIdIndentTag = pPrById?.elements?.find((el) => el.name === 'w:ind') || {};
    pPrStyleJc = pPrById?.elements?.find((el) => el.name === 'w:jc') || {};
  }

  const { attributes: pPrDefaultSpacingAttr } = pPrDefaultSpacingTag;
  const { attributes: pPrNormalSpacingAttr } = pPrNormalSpacingTag;
  const { attributes: pPrByIdSpacingAttr } = pPrStyleIdSpacingTag;
  const { attributes: pPrByIdJcAttr } = pPrStyleJc;

  const { attributes: pPrDefaultIndentAttr } = pPrDefaultIndentTag;
  const { attributes: pPrNormalIndentAttr } = pPrNormalIndentTag;
  const { attributes: pPrByIdIndentAttr } = pPrStyleIdIndentTag;

  const spacingRest = isNormalAsDefault
    ? pPrNormalSpacingAttr || pPrDefaultSpacingAttr
    : pPrDefaultSpacingAttr || pPrNormalSpacingAttr;

  const indentRest = isNormalAsDefault
    ? pPrNormalIndentAttr || pPrDefaultIndentAttr
    : pPrDefaultIndentAttr || pPrNormalIndentAttr;

  return {
    spacing: pPrByIdSpacingAttr || spacingRest,
    indent: pPrByIdIndentAttr || indentRest,
    justify: pPrByIdJcAttr,
  };
};

/**
 * @type {import("docxImporter").NodeHandlerEntry}
 */
export const paragraphNodeHandlerEntity = {
  handlerName: 'paragraphNodeHandler',
  handler: handleParagraphNode,
};

/**
 * @param {string} defaultStyleId
 * @param {ParsedDocx} docx
 */
export function getDefaultStyleDefinition(defaultStyleId, docx) {
  const result = { lineSpaceBefore: null, lineSpaceAfter: null };
  if (!defaultStyleId) return result;

  const styles = docx['word/styles.xml'];
  if (!styles) return result;

  const { elements } = styles.elements[0];
  const elementsWithId = elements.filter((el) => {
    const { attributes } = el;
    return attributes && attributes['w:styleId'] === defaultStyleId;
  });

  const firstMatch = elementsWithId[0];
  if (!firstMatch) return result;

  const qFormat = elementsWithId.find((el) => {
    const qFormat = el.elements.find((innerEl) => innerEl.name === 'w:qFormat');
    return qFormat;
  });

  const name = elementsWithId
    .find((el) => el.elements.some((inner) => inner.name === 'w:name'))
    ?.elements.find((inner) => inner.name === 'w:name')?.attributes['w:val'];

  // pPr
  const pPr = firstMatch.elements.find((el) => el.name === 'w:pPr');
  const spacing = pPr?.elements?.find((el) => el.name === 'w:spacing');
  const justify = pPr?.elements?.find((el) => el.name === 'w:jc');
  const indent = pPr?.elements?.find((el) => el.name === 'w:ind');

  let lineSpaceBefore, lineSpaceAfter, line;
  if (spacing) {
    lineSpaceBefore = twipsToPixels(spacing?.attributes['w:before']);
    lineSpaceAfter = twipsToPixels(spacing?.attributes['w:after']);
    line = twipsToLines(spacing?.attributes['w:line']);
  }

  let textAlign, leftIndent, rightIndent, firstLine;
  if (indent) {
    textAlign = justify?.attributes['w:val'];
    leftIndent = twipsToPixels(indent?.attributes['w:left']);
    rightIndent = twipsToPixels(indent?.attributes['w:right']);
    firstLine = twipsToPixels(indent?.attributes['w:firstLine']);
  }

  const keepNext = pPr?.elements?.find((el) => el.name === 'w:keepNext');
  const keepLines = pPr?.elements?.find((el) => el.name === 'w:keepLines');

  const outlineLevel = pPr?.elements?.find((el) => el.name === 'w:outlineLvl');
  const outlineLvlValue = outlineLevel?.attributes['w:val'];

  const pageBreakBefore = pPr?.elements?.find((el) => el.name === 'w:pageBreakBefore');
  let pageBreakBeforeVal = 0;
  if (pageBreakBefore) {
    if (!pageBreakBefore.attributes?.['w:val']) pageBreakBeforeVal = 1;
    else pageBreakBeforeVal = Number(pageBreakBefore?.attributes?.['w:val']);
  }
  const pageBreakAfter = pPr?.elements?.find((el) => el.name === 'w:pageBreakAfter');
  let pageBreakAfterVal;
  if (pageBreakAfter) {
    if (!pageBreakAfter.attributes?.['w:val']) pageBreakAfterVal = 1;
    else pageBreakAfterVal = Number(pageBreakAfter?.attributes?.['w:val']);
  }

  const basedOn = elementsWithId
    .find((el) => el.elements.some((inner) => inner.name === 'w:basedOn'))
    ?.elements.find((inner) => inner.name === 'w:basedOn')?.attributes['w:val'];

  const parsedAttrs = {
    name,
    qFormat: qFormat ? true : false,
    keepNext: keepNext ? true : false,
    keepLines: keepLines ? true : false,
    outlineLevel: outlineLevel ? parseInt(outlineLvlValue) : null,
    pageBreakBefore: pageBreakBeforeVal ? true : false,
    pageBreakAfter: pageBreakAfterVal ? true : false,
    basedOn: basedOn ?? null,
  };

  // rPr
  const rPr = firstMatch.elements.find((el) => el.name === 'w:rPr');
  const parsedMarks = parseMarks(rPr, [], docx) || {};
  const parsedStyles = {
    spacing: { lineSpaceAfter, lineSpaceBefore, line },
    textAlign,
    indent: { leftIndent, rightIndent, firstLine },
  };

  parsedMarks.forEach((mark) => {
    const { type, attrs } = mark;
    if (type === 'textStyle') {
      Object.entries(attrs).forEach(([key, value]) => {
        parsedStyles[kebabCase(key)] = value;
      });
      return;
    }

    parsedStyles[type] = attrs;
  });

  // pPr marks
  return {
    attrs: parsedAttrs,
    styles: parsedStyles,
  };
}

/**
 * We need to pre-process nodes in a paragraph to combine nodes together where necessary ie: links
 * TODO: Likely will find more w:fldChar to deal with.
 *
 * @param {XmlNode[]} nodes
 * @returns
 */
export function preProcessNodesForFldChar(nodes = []) {
  const processedNodes = [];
  let buffer = [];
  let collecting = false;

  for (const node of nodes) {
    const fldCharEl = node.elements?.find((el) => el.name === 'w:fldChar');
    const fldType = fldCharEl?.attributes?.['w:fldCharType'];

    if (fldType === 'begin') {
      buffer = [node];
      collecting = true;
      continue;
    }

    if (fldType === 'separate' && collecting) {
      buffer.push(node);
      continue;
    }

    if (fldType === 'end' && collecting) {
      buffer.push(node);
      processedNodes.push(...processCombinedNodesForFldChar(buffer));
      buffer = [];
      collecting = false;
      continue;
    }

    if (collecting) {
      buffer.push(node);
    } else {
      processedNodes.push(node);
    }
  }

  // In case of unclosed field
  if (buffer.length) {
    processedNodes.push(...buffer);
  }

  return processedNodes;
}

/**
 * Process the combined nodes for fldChar
 *
 * @param {Array} nodesToCombine List of nodes to combine
 * @returns {Array} Processed nodes
 */
const processCombinedNodesForFldChar = (nodesToCombine = []) => {
  let processedNodes = [];
  let hasPageMarker = false;
  let isNumPages = false;

  // Need to extract all nodes between 'separate' and 'end' fldChar nodes
  const textStart = nodesToCombine.findIndex((n) =>
    n.elements?.some((el) => el.name === 'w:fldChar' && el.attributes['w:fldCharType'] === 'separate'),
  );
  const textEnd = nodesToCombine.findIndex((n) =>
    n.elements?.some((el) => el.name === 'w:fldChar' && el.attributes['w:fldCharType'] === 'end'),
  );

  const textNodes = nodesToCombine.slice(textStart + 1, textEnd);
  const instrTextContainer = nodesToCombine.find((n) => n.elements?.some((el) => el.name === 'w:instrText'));
  const instrTextNode = instrTextContainer?.elements?.find((el) => el.name === 'w:instrText');
  const instrText = instrTextNode?.elements[0].text;

  if (!hasPageMarker) hasPageMarker = instrText?.trim().startsWith('PAGE');
  if (!isNumPages) isNumPages = instrText?.trim().startsWith('NUMPAGES');
  const urlMatch = instrText?.match(/HYPERLINK\s+"([^"]+)"/);

  // If we have a page marker, we need to replace the last node with a page number node.
  if (hasPageMarker) {
    const pageNumNode = {
      name: 'sd:autoPageNumber',
      type: 'element',
    };

    nodesToCombine.forEach((n) => {
      const rPrNode = n.elements.find((el) => el.name === 'w:rPr');
      if (rPrNode) pageNumNode.elements = [rPrNode];
    });

    processedNodes.push(pageNumNode);
  }

  // If we have a NUMPAGES marker, we need to replace the last node with a total page number node.
  else if (isNumPages) {
    const totalPageNumNode = {
      name: 'sd:totalPageNumber',
      type: 'element',
    };

    nodesToCombine.forEach((n) => {
      const rPrNode = n.elements.find((el) => el.name === 'w:rPr');
      if (rPrNode) totalPageNumNode.elements = [rPrNode];
    });
    processedNodes.push(totalPageNumNode);
  }

  // If we have a hyperlink, we need to replace the last node with a link node.
  else if (urlMatch && urlMatch?.length >= 2) {
    const url = urlMatch[1];

    const textMarks = [];
    textNodes.forEach((n) => {
      const rPr = n.elements.find((el) => el.name === 'w:rPr');
      if (!rPr) return;

      const { elements } = rPr;
      elements.forEach((el) => {
        textMarks.push(el);
      });
    });

    // Create a rPr and replace all nodes with the updated node.
    const linkMark = { name: 'link', attributes: { href: url } };
    const rPr = { name: 'w:rPr', type: 'element', elements: [linkMark, ...textMarks] };
    processedNodes.push({
      name: 'w:r',
      type: 'element',
      elements: [rPr, ...textNodes],
    });
  }

  return processedNodes;
};
