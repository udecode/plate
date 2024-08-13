import {
  type InsertNodesOptions,
  type PlateEditor,
  getParentNode,
  insertNodes,
} from '@udecode/plate-common';

import type { TMediaEmbedElement } from '../types';

import { MediaEmbedPlugin } from '../MediaEmbedPlugin';

export const insertMediaEmbed = <E extends PlateEditor>(
  editor: E,
  {
    key = MediaEmbedPlugin.key,
    url = '',
  }: { key?: string } & Partial<TMediaEmbedElement>,
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
