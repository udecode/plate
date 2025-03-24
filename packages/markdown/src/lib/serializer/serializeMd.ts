import type { Descendant, SlateEditor } from '@udecode/plate';

import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { type Plugin, unified } from 'unified';

import type { mdast } from './types';

import { MarkdownPlugin } from '../MarkdownPlugin';
import { convertNodes } from './convertNodes';
/** Serialize the editor value to Markdown. */
export const serializeMd = (
  editor: SlateEditor,
  options?: { value: Descendant[] }
) => {
  const remarkPlugins: Plugin[] =
    editor.getOptions(MarkdownPlugin).remarkPlugins;

  const toRemarkProcessor = unified()
    .use(remarkPlugins)
    .use(remarkStringify)
    .use(remarkGfm);

  const nodesToSerialize = options?.value ?? editor.children;

  return toRemarkProcessor.stringify(
    slateToMdast({ editor, nodes: nodesToSerialize })
  );
};

const slateToMdast = ({
  editor,
  nodes,
}: {
  editor: SlateEditor;
  nodes: Descendant[];
}): mdast.Root => {
  return {
    children: convertNodes(nodes, editor) as mdast.Root['children'],
    type: 'root',
  } as mdast.Root;
};
