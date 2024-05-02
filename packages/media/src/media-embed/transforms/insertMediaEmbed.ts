import {
  type InsertNodesOptions,
  type PlateEditor,
  type PlatePluginKey,
  type Value,
  getParentNode,
  insertNodes,
} from '@udecode/plate-common/server';

import type { TMediaEmbedElement } from '../types';

import { ELEMENT_MEDIA_EMBED } from '../createMediaEmbedPlugin';

export const insertMediaEmbed = <V extends Value>(
  editor: PlateEditor<V>,
  {
    key = ELEMENT_MEDIA_EMBED,
    url = '',
  }: Partial<TMediaEmbedElement> & PlatePluginKey,
  options: InsertNodesOptions<V> = {}
): void => {
  if (!editor.selection) return;

  const selectionParentEntry = getParentNode(editor, editor.selection);

  if (!selectionParentEntry) return;

  const [, path] = selectionParentEntry;
  insertNodes<TMediaEmbedElement>(
    editor,
    {
      children: [{ text: '' }],
      type: key,
      url,
    },
    {
      at: path,
      nextBlock: true,
      ...(options as any),
    }
  );
};
