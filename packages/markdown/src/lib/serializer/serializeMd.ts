import type { Descendant, SlateEditor } from '@udecode/plate';

import remarkStringify from 'remark-stringify';
import { type Plugin, unified } from 'unified';

import type { MdRoot } from '../mdast';

import { MarkdownPlugin } from '../MarkdownPlugin';
import { convertNodesSerialize } from './convertNodes';

export type SerializeMdOptions = {
  editor: SlateEditor;
};

/** Serialize the editor value to Markdown. */
export const serializeMd = (
  editor: SlateEditor,

  // TODO:
  options?: Omit<SerializeMdOptions, 'editor'> & {
    value?: Descendant[];
  }
) => {
  const remarkPlugins: Plugin[] =
    editor.getOptions(MarkdownPlugin).remarkPlugins;

  const toRemarkProcessor = unified().use(remarkPlugins).use(remarkStringify);

  const nodesToSerialize = options?.value ?? editor.children;

  return toRemarkProcessor.stringify(
    slateToMdast({
      nodes: nodesToSerialize,
      options: {
        editor,
      },
    })
  );
};

const slateToMdast = ({
  nodes,
  options,
}: {
  nodes: Descendant[];
  options: SerializeMdOptions;
}): MdRoot => {
  return {
    children: convertNodesSerialize(nodes, options) as MdRoot['children'],
    type: 'root',
  } as MdRoot;
};
