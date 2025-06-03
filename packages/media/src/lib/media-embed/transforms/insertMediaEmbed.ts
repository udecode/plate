import type {
  InsertNodesOptions,
  SlateEditor,
  TMediaEmbedElement,
} from '@udecode/plate';

import { KEYS } from '@udecode/plate';

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
      type: editor.getType(KEYS.mediaEmbed),
      url,
    },
    {
      at: path,
      nextBlock: true,
      ...(options as any),
    }
  );
};
