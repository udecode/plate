import type { Descendant, SlateEditor } from '@udecode/plate';

import remarkGfm from 'remark-gfm';
import math from 'remark-math';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

import type { mdast } from './types';

import { convertNodes } from './convertNodes';

/** Serialize the editor value to Markdown. */
export const serializeMd = (
  editor: SlateEditor,
  options?: { value: Descendant[] }
) => {
  const toRemarkProcessor = unified()
    .use(remarkGfm)
    .use(math)
    .use(remarkStringify);

  const nodesToSerialize = options?.value ?? editor.children;

  return toRemarkProcessor.stringify(slateToMdast(nodesToSerialize));
};

const slateToMdast = (nodes: Descendant[], overrides?: any): mdast.Root => {
  const r = {
    children: convertNodes(
      nodes as Descendant[],
      overrides
    ) as mdast.Root['children'],
    type: 'root',
  };
  return r as mdast.Root;
};
