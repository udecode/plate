import { objectIncludes } from '../../../utilities/objectIncludes.js';

export const mergeTextNodes = (nodes) => {
  if (!nodes || !Array.isArray(nodes)) {
    return nodes;
  }

  let mergedNodes = [];
  let prevTextNode = null;

  for (let node of nodes) {
    if (node.type === 'text') {
      if (prevTextNode && canMergeTextNodes(prevTextNode, node)) {
        // Merge text nodes.
        prevTextNode = {
          ...prevTextNode,
          text: (prevTextNode.text += node.text),
        };
      } else {
        // Update prev text node.
        if (prevTextNode) mergedNodes.push(prevTextNode);
        prevTextNode = { ...node };
      }
    } else {
      // Add prev text node if exists and reset.
      if (prevTextNode) {
        mergedNodes.push(prevTextNode);
        prevTextNode = null;
      }
      // Add non-text node.
      mergedNodes.push(node);
    }
  }

  // Add last prev text node if exists.
  if (prevTextNode) {
    mergedNodes.push(prevTextNode);
  }

  return mergedNodes;
};

const canMergeTextNodes = (nodeA, nodeB) => {
  if (!nodeA || !nodeB) return false;

  let marksA = nodeA.marks ?? [];
  let marksB = nodeB.marks ?? [];

  if (marksA.length !== marksB.length) {
    return false;
  }

  for (let i = 0; i < marksA.length; i++) {
    if (!marksA[i].attrs) marksA[i].attrs = {};
    if (!marksB[i].attrs) marksB[i].attrs = {};

    if (
      marksA[i].type !== marksB[i].type ||
      Object.keys(marksA[i].attrs).length !== Object.keys(marksB[i].attrs).length ||
      !areAttrsEqual(marksA[i].attrs, marksB[i].attrs)
    ) {
      return false;
    }
  }

  return true;
};

const areAttrsEqual = (attrsA = {}, attrsB = {}) => {
  return objectIncludes(attrsA, attrsB);
};
