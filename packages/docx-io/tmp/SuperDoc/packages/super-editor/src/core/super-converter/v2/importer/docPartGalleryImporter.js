/**
 * Handler for docPartObject: docPartGallery node type of 'Table of contents'
 * @param {*} node
 * @param {*} docx
 * @param {*} nodeListHandler
 * @param {*} insideTrackChange
 * @returns {Array} The processed nodes
 */
export const tableOfContentsHandler = (params) => {
  return nodeListHandler.handler({ ...params, nodes: node.elements });
};
