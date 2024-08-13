import {
  type InsertNodesOptions,
  type PlateEditor,
  type TNodeProps,
  getParentNode,
  insertNodes,
} from '@udecode/plate-common';

import type { TExcalidrawElement } from '../types';

import { ELEMENT_EXCALIDRAW } from '../ExcalidrawPlugin';

export const insertExcalidraw = <E extends PlateEditor>(
  editor: E,
  {
    key = ELEMENT_EXCALIDRAW,
    ...props
  }: { key?: string } & TNodeProps<TExcalidrawElement> = {},
  options: InsertNodesOptions<E> = {}
): void => {
  if (!editor.selection) return;

  const selectionParentEntry = getParentNode(editor, editor.selection);

  if (!selectionParentEntry) return;

  const [, path] = selectionParentEntry;

  insertNodes<TExcalidrawElement>(
    editor,
    {
      children: [{ text: '' }],
      type: key,
      ...props,
    },
    { at: path, nextBlock: true, ...(options as any) }
  );
};
