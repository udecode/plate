import { eigthPointsToPixels, halfPointToPoints, twipsToPixels } from '../../helpers.js';

/**
 * @type {import("docxImporter").NodeHandler}
 */
export const handleAllTableNodes = (params) => {
  const { nodes } = params;
  if (nodes.length === 0) {
    return { nodes: [], consumed: 0 };
  }
  const node = nodes[0];

  switch (node.name) {
    case 'w:tbl':
      return { nodes: [handleTableNode(node, params)], consumed: 1 };
  }

  return { nodes: [], consumed: 0 };
};

/**
 * @type {import("docxImporter").NodeHandlerEntry}
 */
export const tableNodeHandlerEntity = {
  handlerName: 'tableNodeHandler',
  handler: handleAllTableNodes,
};

/**
 *
 * @param {XmlNode} node
 * @param {ParsedDocx} docx
 * @param {NodeListHandler} nodeListHandler
 * @param {boolean} insideTrackChange
 * @returns {{type: string, content: *, attrs: {borders: *, tableWidth: *, tableWidthType: *}}}
 */
export function handleTableNode(node, params) {
  const { docx, nodeListHandler } = params;
  // Table styles
  const tblPr = node.elements.find((el) => el.name === 'w:tblPr');

  // Table borders can be specified in tblPr or inside a referenced style tag
  const tableBordersElement = tblPr.elements.find((el) => el.name === 'w:tblBorders');
  const tableBorders = tableBordersElement?.elements || [];
  const { borders, rowBorders } = processTableBorders(tableBorders);
  const tblStyleTag = tblPr.elements.find((el) => el.name === 'w:tblStyle');
  const tableStyleId = tblStyleTag?.attributes['w:val'];

  const attrs = { tableStyleId };

  // Other table properties
  const tableIndent = tblPr?.elements.find((el) => el.name === 'w:tblInd');
  if (tableIndent) {
    const { 'w:w': width, 'w:type': type } = tableIndent.attributes;
    attrs['tableIndent'] = { width: twipsToPixels(width), type };
  }

  const tableLayout = tblPr?.elements.find((el) => el.name === 'w:tblLayout');
  if (tableLayout) {
    const { 'w:type': type } = tableLayout.attributes;
    attrs['tableLayout'] = type;
  }

  const referencedStyles = getReferencedTableStyles(tblStyleTag, docx, nodeListHandler);
  const tblW = tblPr.elements.find((el) => el.name === 'w:tblW');

  if (tblW) {
    attrs['tableWidth'] = {
      width: twipsToPixels(tblW.attributes['w:w']),
      type: tblW.attributes['w:type'],
    };
  }

  const tblCellSpacing = tblPr.elements.find((el) => el.name === 'w:tblCellSpacing');
  if (tblCellSpacing) {
    attrs['tableCellSpacing'] = {
      w: tblCellSpacing.attributes['w:w'],
      type: tblCellSpacing.attributes['w:type'],
    };
    attrs['borderCollapse'] = 'separate';
  }

  const tblJustification = tblPr.elements.find((el) => el.name === 'w:jc');
  if (tblJustification?.attributes) {
    attrs['justification'] = tblJustification.attributes['w:val'];
  }

  // TODO: What does this do?
  // const tblLook = tblPr.elements.find((el) => el.name === 'w:tblLook');

  const rows = node.elements.filter((el) => el.name === 'w:tr');
  const refStylesBorders = referencedStyles?.borders || {};
  const refStylesRowBorders = referencedStyles?.rowBorders || {};

  const borderData = Object.keys(borders)?.length ? Object.assign(refStylesBorders, borders) : refStylesBorders;
  const borderRowData = Object.keys(rowBorders)?.length
    ? Object.assign(refStylesRowBorders, rowBorders)
    : refStylesRowBorders;
  attrs['borders'] = borderData;

  const content = [];
  rows.forEach((row) => {
    const result = handleTableRowNode(row, node, borderRowData, tblStyleTag, params);
    if (result.content?.length) content.push(result);
  });

  return {
    type: 'table',
    content,
    attrs,
  };
}

/**
 *
 * @param node
 * @param {ParsedDocx} docx
 * @param {NodeListHandler} nodeListHandler
 * @param {boolean} insideTrackChange
 * @returns {{type: string, content: (*|*[]), attrs: {}}}
 */
export function handleTableCellNode(node, row, table, rowBorders, columnWidth = null, styleTag, params, columnIndex) {
  const { docx, nodeListHandler } = params;
  const tcPr = node.elements.find((el) => el.name === 'w:tcPr');
  const borders = tcPr?.elements?.find((el) => el.name === 'w:tcBorders');
  const inlineBorders = processInlineCellBorders(borders, rowBorders);

  const gridColumnWidths = getGridColumnWidths(table);

  const tcWidth = tcPr?.elements?.find((el) => el.name === 'w:tcW');
  let width = tcWidth ? twipsToPixels(tcWidth.attributes['w:w']) : null;
  const widthType = tcWidth?.attributes['w:type'];

  if (!width && columnWidth) width = columnWidth;

  const vMerge = getTableCellMergeTag(node);
  const { attributes: vMergeAttrs } = vMerge || {};

  // TODO: Do we need other background attrs?
  const backgroundColor = tcPr?.elements?.find((el) => el.name === 'w:shd');
  const background = {
    color: backgroundColor?.attributes['w:fill'],
  };

  const colspanTag = tcPr?.elements?.find((el) => el.name === 'w:gridSpan');
  const colspan = colspanTag?.attributes['w:val'];

  const marginTag = tcPr?.elements?.find((el) => el.name === 'w:tcMar');

  const verticalAlignTag = tcPr?.elements?.find((el) => el.name === 'w:vAlign');
  const verticalAlign = verticalAlignTag?.attributes['w:val'] || 'top';

  const attributes = {};
  const referencedStyles = getReferencedTableStyles(styleTag, docx) || {};
  attributes.cellMargins = getTableCellMargins(marginTag, referencedStyles);

  const { fontSize, fonts = {} } = referencedStyles;
  const fontFamily = fonts['ascii'];

  if (width) {
    attributes['colwidth'] = [width];
    attributes['widthUnit'] = 'px';

    const defaultColWidths = gridColumnWidths;
    const hasDefaultColWidths = gridColumnWidths && gridColumnWidths.length > 0;
    const colspanNum = parseInt(colspan || 1, 10);

    if (colspanNum && colspanNum > 1 && hasDefaultColWidths) {
      let colwidth = [];

      for (let i = 0; i < colspanNum; i++) {
        let colwidthValue = defaultColWidths[columnIndex + i];
        let defaultColwidth = 100;

        if (typeof colwidthValue !== 'undefined') {
          colwidth.push(colwidthValue);
        } else {
          colwidth.push(defaultColwidth);
        }
      }

      if (colwidth.length) {
        attributes['colwidth'] = [...colwidth];
      }
    }
  }

  if (widthType) attributes['widthType'] = widthType;
  if (colspan) attributes['colspan'] = parseInt(colspan, 10);
  if (background) attributes['background'] = background;
  if (verticalAlign) attributes['verticalAlign'] = verticalAlign;
  if (fontSize) attributes['fontSize'] = fontSize;
  if (fontFamily) attributes['fontFamily'] = fontFamily['ascii'];
  if (rowBorders) attributes['borders'] = { ...rowBorders };
  if (inlineBorders) attributes['borders'] = Object.assign(attributes['borders'] || {}, inlineBorders);

  // Tables can have vertically merged cells, indicated by the vMergeAttrs
  // if (vMerge) attributes['vMerge'] = vMergeAttrs || 'merged';
  if (vMergeAttrs && vMergeAttrs['w:val'] === 'restart') {
    const rows = table.elements.filter((el) => el.name === 'w:tr');
    const currentRowIndex = rows.findIndex((r) => r === row);
    const remainingRows = rows.slice(currentRowIndex + 1);

    const cellsInRow = row.elements.filter((el) => el.name === 'w:tc');
    let cellIndex = cellsInRow.findIndex((el) => el === node);
    let rowspan = 1;

    // Iterate through all remaining rows after the current cell, and find all cells that need to be merged
    for (let remainingRow of remainingRows) {
      const firstCell = remainingRow.elements.findIndex((el) => el.name === 'w:tc');
      const cellAtIndex = remainingRow.elements[firstCell + cellIndex];

      if (!cellAtIndex) break;

      const vMerge = getTableCellMergeTag(cellAtIndex);
      const { attributes: currentCellMergeAttrs } = vMerge || {};
      if (
        (!vMerge && !currentCellMergeAttrs) ||
        (currentCellMergeAttrs && currentCellMergeAttrs['w:val'] === 'restart')
      ) {
        // We have reached the end of the vertically merged cells
        break;
      }

      // This cell is part of a merged cell, merge it (remove it from its row)
      rowspan++;
      remainingRow.elements.splice(firstCell + cellIndex, 1);
    }
    attributes['rowspan'] = rowspan;
  }

  return {
    type: 'tableCell',
    content: nodeListHandler.handler({ ...params, nodes: node.elements }),
    attrs: attributes,
  };
}

const getTableCellMergeTag = (node) => {
  const tcPr = node.elements.find((el) => el.name === 'w:tcPr');
  const vMerge = tcPr?.elements?.find((el) => el.name === 'w:vMerge');
  return vMerge;
};

const processBorder = (borders, direction, rowBorders = {}) => {
  const borderAttrs = borders?.elements?.find((el) => el.name === `w:${direction}`)?.attributes;

  if (borderAttrs && borderAttrs['w:val'] !== 'nil') {
    const border = {};
    const color = borderAttrs['w:color'];
    if (color) border['color'] = color === 'auto' ? '#000000' : `#${color}`;
    const size = borderAttrs['w:sz'];
    if (size) border['size'] = eigthPointsToPixels(size);
    return border;
  }
  if (borderAttrs && borderAttrs['w:val'] === 'nil') {
    const border = Object.assign({}, rowBorders[direction] || {});
    if (!Object.keys(border)) return null;
    border['val'] = 'none';
    return border;
  }
  return null;
};

const processInlineCellBorders = (borders, rowBorders) => {
  if (!borders) return null;

  const processedBorders = {};
  const inlineBorderBottom = processBorder(borders, 'bottom', rowBorders);
  if (inlineBorderBottom) processedBorders['bottom'] = inlineBorderBottom;
  const inlineBorderTop = processBorder(borders, 'top', rowBorders);
  if (inlineBorderTop) processedBorders['top'] = inlineBorderTop;
  const inlineBorderLeft = processBorder(borders, 'left', rowBorders);
  if (inlineBorderLeft) processedBorders['left'] = inlineBorderLeft;
  const inlineBorderRight = processBorder(borders, 'right', rowBorders);
  if (inlineBorderRight) processedBorders['right'] = inlineBorderRight;

  return processedBorders;
};

/**
 *
 * @param tblStyleTag
 * @param {ParsedDocx} docx
 * @param {NodeListHandler} nodeListHandler
 * @returns {{uiPriotity: *, borders: {}, name: *, rowBorders: {}, basedOn: *}|null}
 */
function getReferencedTableStyles(tblStyleTag, docx) {
  if (!tblStyleTag) return null;

  const stylesToReturn = {};
  const { attributes = {} } = tblStyleTag;
  const tableStyleReference = attributes['w:val'];
  if (!tableStyleReference) return null;

  const styles = docx['word/styles.xml'];
  const { elements } = styles.elements[0];
  const styleElements = elements.filter((el) => el.name === 'w:style');
  const styleTag = styleElements.find((el) => el.attributes['w:styleId'] === tableStyleReference);
  if (!styleTag) return null;

  stylesToReturn.name = styleTag.elements.find((el) => el.name === 'w:name');

  // TODO: Do we need this?
  const basedOn = styleTag.elements.find((el) => el.name === 'w:basedOn');

  let baseTblPr;
  if (basedOn?.attributes) {
    const baseStyles = styleElements.find((el) => el.attributes['w:styleId'] === basedOn.attributes['w:val']);
    baseTblPr = baseStyles ? baseStyles.elements.find((el) => el.name === 'w:tblPr') : {};
  }

  const pPr = styleTag.elements.find((el) => el.name === 'w:pPr');
  if (pPr) {
    const justification = pPr.elements.find((el) => el.name === 'w:jc');
    if (justification?.attributes) stylesToReturn.justification = justification.attributes['w:val'];
  }

  const rPr = styleTag?.elements.find((el) => el.name === 'w:rPr');
  if (rPr) {
    const fonts = rPr.elements.find((el) => el.name === 'w:rFonts');
    if (fonts) {
      const { 'w:ascii': ascii, 'w:hAnsi': hAnsi, 'w:cs': cs } = fonts.attributes;
      stylesToReturn.fonts = { ascii, hAnsi, cs };
    }

    const fontSize = rPr.elements.find((el) => el.name === 'w:sz');
    if (fontSize?.attributes) stylesToReturn.fontSize = halfPointToPoints(fontSize.attributes['w:val']) + 'pt';
  }

  const tblPr = styleTag.elements.find((el) => el.name === 'w:tblPr');
  if (tblPr && tblPr.elements) {
    if (baseTblPr && baseTblPr.elements) {
      tblPr.elements.push(...baseTblPr.elements);
    }

    const tableBorders = tblPr?.elements?.find((el) => el.name === 'w:tblBorders');
    const { elements: borderElements = [] } = tableBorders || {};
    const { borders, rowBorders } = processTableBorders(borderElements);
    if (borders) stylesToReturn.borders = borders;
    if (rowBorders) stylesToReturn.rowBorders = rowBorders;

    const tableCellMargin = tblPr?.elements.find((el) => el.name === 'w:tblCellMar');
    if (tableCellMargin) {
      const marginLeft = tableCellMargin.elements.find((el) => el.name === 'w:left');
      const marginRight = tableCellMargin.elements.find((el) => el.name === 'w:right');
      const marginTop = tableCellMargin.elements.find((el) => el.name === 'w:top');
      const marginBottom = tableCellMargin.elements.find((el) => el.name === 'w:bottom');
      stylesToReturn.cellMargins = {
        marginLeft: marginLeft?.attributes['w:w'],
        marginRight: marginRight?.attributes['w:w'],
        marginTop: marginTop?.attributes['w:w'],
        marginBottom: marginBottom?.attributes['w:w'],
      };
    }
  }

  return stylesToReturn;
}

/**
 * Process the table borders
 * @param {Object[]} borderElements
 * @returns
 */
function processTableBorders(borderElements) {
  const borders = {};
  const rowBorders = {};
  borderElements.forEach((borderElement) => {
    const { name } = borderElement;
    const borderName = name.split('w:')[1];
    const { attributes } = borderElement;

    const attrs = {};
    const color = attributes['w:color'];
    const size = attributes['w:sz'];
    if (color && color !== 'auto') attrs['color'] = color.startsWith('#') ? color : `#${color}`;
    if (size && size !== 'auto') attrs['size'] = eigthPointsToPixels(size);

    const rowBorderNames = ['insideH', 'insideV'];
    if (rowBorderNames.includes(borderName)) rowBorders[borderName] = attrs;
    borders[borderName] = attrs;
  });

  return {
    borders,
    rowBorders,
  };
}

/**
 * Process a table row node
 * @param node
 * @param {undefined | null | {insideH?: *, insideV?: *}} rowBorders
 * @param {ParsedDocx} docx
 * @param {NodeListHandler} nodeListHandler
 * @param {boolean} insideTrackChange
 * @returns {*}
 */
export function handleTableRowNode(node, table, rowBorders, styleTag, params) {
  const attrs = {};

  const tPr = node.elements.find((el) => el.name === 'w:trPr');
  const rowHeightTag = tPr?.elements?.find((el) => el.name === 'w:trHeight');
  const rowHeight = rowHeightTag?.attributes['w:val'];

  const borders = {};
  if (rowBorders?.insideH) borders['bottom'] = rowBorders.insideH;
  if (rowBorders?.insideV) borders['right'] = rowBorders.insideV;
  attrs['borders'] = borders;

  if (rowHeight) {
    attrs['rowHeight'] = twipsToPixels(rowHeight);
  }

  const gridColumnWidths = getGridColumnWidths(table);
  const cellNodes = node.elements.filter((el) => el.name === 'w:tc');

  let currentColumnIndex = 0;
  const content =
    cellNodes?.map((n) => {
      let colWidth = gridColumnWidths?.[currentColumnIndex] || null;

      const result = handleTableCellNode(n, node, table, borders, colWidth, styleTag, params, currentColumnIndex);

      const tcPr = n.elements?.find((el) => el.name === 'w:tcPr');
      const colspanTag = tcPr?.elements?.find((el) => el.name === 'w:gridSpan');
      const colspan = parseInt(colspanTag?.attributes['w:val'] || 1, 10);
      currentColumnIndex += colspan;

      return result;
    }) || [];
  const newNode = {
    type: 'tableRow',
    content,
    attrs,
  };
  return newNode;
}

/**
 * Process the margins for a table cell
 * @param {Object} marginTag
 * @param {Object} referencedStyles
 * @returns
 */
const getTableCellMargins = (marginTag, referencedStyles) => {
  const inlineMarginLeftTag = marginTag?.elements?.find((el) => el.name === 'w:left');
  const inlineMarginRightTag = marginTag?.elements?.find((el) => el.name === 'w:right');
  const inlineMarginTopTag = marginTag?.elements?.find((el) => el.name === 'w:top');
  const inlineMarginBottomTag = marginTag?.elements?.find((el) => el.name === 'w:bottom');

  const inlineMarginLeftValue = inlineMarginLeftTag?.attributes['w:w'];
  const inlineMarginRightValue = inlineMarginRightTag?.attributes['w:w'];
  const inlineMarginTopValue = inlineMarginTopTag?.attributes['w:w'];
  const inlineMarginBottomValue = inlineMarginBottomTag?.attributes['w:w'];

  const { cellMargins = {} } = referencedStyles;
  const {
    marginLeft: marginLeftStyle,
    marginRight: marginRightStyle,
    marginTop: marginTopStyle,
    marginBottom: marginBottomStyle,
  } = cellMargins;

  const margins = {
    left: twipsToPixels(inlineMarginLeftValue ?? marginLeftStyle),
    right: twipsToPixels(inlineMarginRightValue ?? marginRightStyle),
    top: twipsToPixels(inlineMarginTopValue ?? marginTopStyle),
    bottom: twipsToPixels(inlineMarginBottomValue ?? marginBottomStyle),
  };
  return margins;
};

const getGridColumnWidths = (tableNode) => {
  const tblGrid = tableNode.elements.find((el) => el.name === 'w:tblGrid');
  if (!tblGrid) return [];
  const columnWidths =
    tblGrid?.elements?.flatMap((el) => {
      if (el.name !== 'w:gridCol') return [];
      return twipsToPixels(el.attributes['w:w']);
    }) || [];
  return columnWidths;
};
