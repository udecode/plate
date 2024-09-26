import {
  type InsertNodesOptions,
  type SlateEditor,
  getParentNode,
  insertNodes,
} from '@udecode/plate-common';

import {
  type TMediaEmbedElement,
  BaseMediaEmbedPlugin,
} from '../BaseMediaEmbedPlugin';

export const insertMediaEmbed = <E extends SlateEditor>(
  editor: E,
  { url = '' }: Partial<TMediaEmbedElement>,
  options: InsertNodesOptions<E> = {}
): void => {
  if (!editor.selection) return;

  const selectionParentEntry = getParentNode(editor, editor.selection);

  if (!selectionParentEntry) return;

  const [, path] = selectionParentEntry;
  insertNodes<TMediaEmbedElement>(
    editor,
    {
      children: [{ text: '' }],
      type: editor.getType(BaseMediaEmbedPlugin),
      url,
    },
    {
      at: path,
      nextBlock: true,
      ...(options as any),
    }
  );
};
