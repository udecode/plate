import type { Descendant } from '@udecode/plate';

import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

import { convertTexts } from './convertTexts';

export const serializeInlineMd = (nodes: Descendant[]) => {
  const toRemarkProcessor = unified().use(remarkGfm).use(remarkStringify);

  if (nodes.length === 0) return '';

  // Serialize the content
  const serializedContent = toRemarkProcessor.stringify({
    children: convertTexts(nodes as any),
    type: 'root',
  });

  return serializedContent;
};
