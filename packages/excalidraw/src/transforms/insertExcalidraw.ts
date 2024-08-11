import type { ValueOf } from '@udecode/plate-common';

import {
  type InsertNodesOptions,
  type PlateEditor,
  type PlatePluginKey,
  type TNodeProps,
  getParentNode,
  insertNodes,
} from '@udecode/plate-common/server';

import type { TExcalidrawElement } from '../types';

import { ELEMENT_EXCALIDRAW } from '../ExcalidrawPlugin';

export const insertExcalidraw = <E extends PlateEditor>(
  editor: E,
  {
    key = ELEMENT_EXCALIDRAW,
    ...props
  }: PlatePluginKey & TNodeProps<TExcalidrawElement> = {},
  options: InsertNodesOptions<ValueOf<E>> = {}
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
