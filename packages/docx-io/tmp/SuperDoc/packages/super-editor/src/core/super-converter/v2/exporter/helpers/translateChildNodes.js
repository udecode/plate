import { exportSchemaToJson } from '../../../exporter.js';

/**
 * Process child nodes, ignoring any that are not valid
 *
 * @param {SchemaNode[]} nodes The input nodes
 * @returns {XmlReadyNode[]} The processed child nodes
 */
export function translateChildNodes(params) {
  const { content: nodes } = params.node;
  if (!nodes) return [];

  const translatedNodes = [];
  nodes.forEach((node) => {
    let translatedNode = exportSchemaToJson({ ...params, node });

    if (translatedNode instanceof Array) translatedNodes.push(...translatedNode);
    else translatedNodes.push(translatedNode);
  });

  // Filter out any null nodes
  return translatedNodes.filter((n) => n);
}
