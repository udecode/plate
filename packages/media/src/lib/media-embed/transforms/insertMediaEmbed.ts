import type { InsertNodesOptions, SlateEditor } from '@udecode/plate';

import {
  type TMediaEmbedElement,
  BaseMediaEmbedPlugin,
} from '../BaseMediaEmbedPlugin';

export const insertMediaEmbed = (
  editor: SlateEditor,
  { url = '' }: Partial<TMediaEmbedElement>,
  options: InsertNodesOptions = {}
): void => {
  if (!editor.selection) return;

  const selectionParentEntry = editor.api.parent(editor.selection);

  if (!selectionParentEntry) return;

  const [, path] = selectionParentEntry;
  editor.tf.insertNodes<TMediaEmbedElement>(
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
