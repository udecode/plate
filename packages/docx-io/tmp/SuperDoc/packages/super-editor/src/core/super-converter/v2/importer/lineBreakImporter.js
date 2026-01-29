/**
 * @type {import("docxImporter").NodeHandler}
 */
export const handleLineBreakNode = (params) => {
  const { nodes } = params;
  if (nodes.length === 0 || nodes[0].name !== 'w:br') {
    return { nodes: [], consumed: 0 };
  }

  const attrs = {};

  const lineBreakType = nodes[0].attributes?.['w:type'];
  if (lineBreakType) attrs['lineBreakType'] = lineBreakType;

  const breakType = lineBreakType === 'page' ? 'hardBreak' : 'lineBreak';
  return {
    nodes: [
      {
        type: breakType,
      },
    ],
    consumed: 1,
  };
};

/**
 * @type {import("docxImporter").NodeHandlerEntry}
 */
export const lineBreakNodeHandlerEntity = {
  handlerName: 'lineBreakNodeHandler',
  handler: handleLineBreakNode,
};
