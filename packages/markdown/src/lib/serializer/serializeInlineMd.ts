import { type Descendant, NodeApi } from '@udecode/plate';

import { serializeMdNodes } from './serializeMdNodes';

// TODO: add keepLeadingSpaces option to serializeMdNodes
export const serializeInlineMd = (nodes: Descendant[]) => {
  if (nodes.length === 0) return '';

  let leadingSpaces = '';

  // Check for leading spaces in the first node
  const firstNodeText = NodeApi.string(nodes[0]);
  const leadingMatch = /^\s*/.exec(firstNodeText);
  leadingSpaces = leadingMatch ? leadingMatch[0] : '';

  // Serialize the content
  const serializedContent = serializeMdNodes(nodes);

  return leadingSpaces + serializedContent;
};
