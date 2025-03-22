import { type Descendant, NodeApi } from '@udecode/plate';
import remarkGfm from 'remark-gfm';
import math from 'remark-math';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

import { convertTexts } from './convertTexts';

// TODO: add keepLeadingSpaces option to serializeMdNodes
export const serializeInlineMd = (nodes: Descendant[]) => {
  const toRemarkProcessor = unified()
    .use(remarkGfm)
    .use(math)
    .use(remarkStringify);

  if (nodes.length === 0) return '';

  let leadingSpaces = '';

  // Check for leading spaces in the first node
  const firstNodeText = NodeApi.string(nodes[0]);
  const leadingMatch = /^\s*/.exec(firstNodeText);
  leadingSpaces = leadingMatch ? leadingMatch[0] : '';

  // Serialize the content
  const serializedContent = toRemarkProcessor.stringify({
    children: convertTexts(nodes as any),
    type: 'root',
  });

  return serializedContent;
};
