import {
  type InsertNodesOptions,
  type PlateEditor,
  type ValueOf,
  getParentNode,
  insertNodes,
} from '@udecode/plate-common';

import type { TMediaEmbedElement } from '../types';

import { ELEMENT_MEDIA_EMBED } from '../MediaEmbedPlugin';

export const insertMediaEmbed = <E extends PlateEditor>(
  editor: E,
  {
    key = ELEMENT_MEDIA_EMBED,
    url = '',
  }: { key?: string } & Partial<TMediaEmbedElement>,
  options: InsertNodesOptions<ValueOf<E>> = {}
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
