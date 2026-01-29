import { parseMarks } from './markImporter.js';

/**
 * @type {import("docxImporter").NodeHandler}
 */
const handleAutoPageNumber = (params) => {
  const { nodes } = params;
  if (nodes.length === 0 || nodes[0].name !== 'sd:autoPageNumber') {
    return { nodes: [], consumed: 0 };
  }

  const rPr = nodes[0].elements?.find((el) => el.name === 'w:rPr');
  const marks = parseMarks(rPr || { elements: [] });
  const processedNode = {
    type: 'page-number',
    attrs: {
      marksAsAttrs: marks,
    },
  };
  return { nodes: [processedNode], consumed: 1 };
};

/**
 * @type {import("docxImporter").NodeHandlerEntry}
 */
export const autoPageHandlerEntity = {
  handlerName: 'autoPageNumberHandler',
  handler: handleAutoPageNumber,
};

/**
 * @type {import("docxImporter").NodeHandler}
 */
const handleAutoTotalPageNumber = (params) => {
  const { nodes } = params;
  if (nodes.length === 0 || nodes[0].name !== 'sd:totalPageNumber') {
    return { nodes: [], consumed: 0 };
  }

  const rPr = nodes[0].elements?.find((el) => el.name === 'w:rPr');
  const marks = parseMarks(rPr || { elements: [] });
  const processedNode = {
    type: 'total-page-number',
    attrs: {
      marksAsAttrs: marks,
    },
  };
  return { nodes: [processedNode], consumed: 1 };
};

/**
 * @type {import("docxImporter").NodeHandlerEntry}
 */
export const autoTotalPageCountEntity = {
  handlerName: 'autoTotalPageCountEntity',
  handler: handleAutoTotalPageNumber,
};
