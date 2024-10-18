import { type TDescendant, getNodeString } from '@udecode/plate-common';

import { serializeMdNodes } from './serializeMdNodes';

// TODO: add keepLeadingSpaces option to serializeMdNodes
export const serializeInlineMd = (nodes: TDescendant[]) => {
  if (nodes.length === 0) return '';

  let leadingSpaces = '';

  // Check for leading spaces in the first node
  const firstNodeText = getNodeString(nodes[0]);
  const leadingMatch = /^\s*/.exec(firstNodeText);
  leadingSpaces = leadingMatch ? leadingMatch[0] : '';

  // Serialize the content
  const serializedContent = serializeMdNodes(nodes);

  return leadingSpaces + serializedContent;
};
