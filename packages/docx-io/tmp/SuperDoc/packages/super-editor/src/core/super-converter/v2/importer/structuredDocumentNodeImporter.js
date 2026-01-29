import { parseAnnotationMarks } from './annotationImporter.js';

/**
 * @type {import("docxImporter").NodeHandler}
 */
export const handleSdtNode = (params) => {
  const { nodes, nodeListHandler } = params;
  if (nodes.length === 0 || nodes[0].name !== 'w:sdt') {
    return { nodes: [], consumed: 0 };
  }

  const node = nodes[0];
  const sdtPr = node.elements.find((el) => el.name === 'w:sdtPr');
  const tag = sdtPr?.elements.find((el) => el.name === 'w:tag');

  /**
   * WARNING: There are multiple types of w:sdt nodes.
   * We need to route to the correct handler depending on certain properties.
   *
   * Example: If tag has documentSection type, we handle it as a document section node.
   * If it has structuredContent type, we handle it as a structured content node.
   */
  let tagValue = tag?.attributes?.['w:val'];
  try {
    tagValue = JSON.parse(tagValue);
    const { type } = tagValue;
    if (type === 'documentSection') return handleDocumentSectionNode(params, tagValue);
  } catch {}

  const sdtContent = node.elements.find((el) => el.name === 'w:sdtContent');
  const { marks } = parseAnnotationMarks(sdtContent);

  const translatedContent = nodeListHandler.handler({ ...params, nodes: sdtContent?.elements });

  let result = {
    type: 'structuredContent',
    content: translatedContent,
    marks,
    attrs: {
      sdtPr,
    },
  };

  return {
    nodes: [result],
    consumed: 1,
  };
};

/**
 * Handle document section node. Special case of w:sdt nodes
 * @param {Object} params - The parameters containing nodes and nodeListHandler
 * @param {Object} tagValue - The tag value containing attributes like id, title,
 *                             and description for the structured content block.
 * @returns {Object} An object containing the processed node and consumed count
 */
const handleDocumentSectionNode = (params, tagValue) => {
  const { nodes, nodeListHandler } = params;
  const node = nodes[0];

  const sdtPr = node.elements.find((el) => el.name === 'w:sdtPr');
  const idTag = sdtPr?.elements.find((el) => el.name === 'w:id');
  const id = idTag?.attributes?.['w:val'] || tagValue.id || null;

  const titleTag = sdtPr?.elements.find((el) => el.name === 'w:alias');
  const title = titleTag?.attributes?.['w:val'] || tagValue.title || null;

  const { description } = tagValue;

  const sdtContent = node.elements.find((el) => el.name === 'w:sdtContent');
  const translatedContent = nodeListHandler.handler({ ...params, nodes: sdtContent?.elements });
  const result = {
    type: 'documentSection',
    content: translatedContent,
    attrs: {
      id,
      title,
      description,
    },
  };

  return {
    nodes: [result],
    consumed: 1,
  };
};

/**
 * @type {import("docxImporter").NodeHandlerEntry}
 */
export const sdtNodeHandlerEntity = {
  handlerName: 'sdtNodeHandler',
  handler: handleSdtNode,
};
