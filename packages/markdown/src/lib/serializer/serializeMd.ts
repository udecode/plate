import type { Descendant, SlateEditor } from '@udecode/plate';

import { type Plugin, unified } from 'unified';

import type { mdast } from './types';

import { type Components, MarkdownPlugin } from '../MarkdownPlugin';
import { convertNodes } from './convertNodes';

/** Serialize the editor value to Markdown. */
export const serializeMd = (
  editor: SlateEditor,
  options?: { value: Descendant[] }
) => {
  const serializePlugins: Plugin[] =
    editor.getOptions(MarkdownPlugin).remarkPlugins.serialize;

  const components = editor.getOptions(MarkdownPlugin).components;

  const toRemarkProcessor = unified().use(serializePlugins);

  const nodesToSerialize = options?.value ?? editor.children;

  return toRemarkProcessor.stringify(slateToMdast(nodesToSerialize));
};

const slateToMdast = (
  nodes: Descendant[],
  components?: Components
): mdast.Root => {
  return {
    children: convertNodes(
      nodes as Descendant[],
      components
    ) as mdast.Root['children'],
    type: 'root',
  } as mdast.Root;
};
