import { getNodeType } from './getNodeType.js';
import { objectIncludes } from '../utilities/objectIncludes.js';

/**
 * Checks if the currently selected node is active.
 * @param state The current editor state.
 * @param typeOrName The type or name of the node (or null).
 * @param attrs The node attrs.
 * @returns Boolean.
 */
export function isNodeActive(state, typeOrName, attrs = {}) {
  const { from, to, empty } = state.selection;
  const type = typeOrName ? getNodeType(typeOrName, state.schema) : null;

  const nodeRanges = [];

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.isText) return;

    const relativeFrom = Math.max(from, pos);
    const relativeTo = Math.min(to, pos + node.nodeSize);
    nodeRanges.push({
      node,
      from: relativeFrom,
      to: relativeTo,
    });
  });

  const selectionRange = to - from;
  const matchedNodeRanges = nodeRanges
    .filter((nodeRange) => {
      if (!type) return true;
      return type.name === nodeRange.node.type.name;
    })
    .filter((nodeRange) => objectIncludes(nodeRange.node.attrs, attrs, { strict: false }));

  if (empty) return !!matchedNodeRanges.length;

  const range = matchedNodeRanges.reduce((sum, nodeRange) => sum + nodeRange.to - nodeRange.from, 0);
  return range >= selectionRange;
}
