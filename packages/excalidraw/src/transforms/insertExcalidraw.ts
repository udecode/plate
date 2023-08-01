import {
  getParentNode,
  insertNodes,
  InsertNodesOptions,
  PlateEditor,
  PlatePluginKey,
  TNodeProps,
  Value,
} from '@udecode/plate-common';

import { ELEMENT_EXCALIDRAW } from '../createExcalidrawPlugin';
import { TExcalidrawElement } from '../types';

export const insertExcalidraw = <V extends Value>(
  editor: PlateEditor<V>,
  {
    key = ELEMENT_EXCALIDRAW,
    ...props
  }: TNodeProps<TExcalidrawElement> & PlatePluginKey = {},
  options: InsertNodesOptions<V> = {}
): void => {
  if (!editor.selection) return;

  const selectionParentEntry = getParentNode(editor, editor.selection);
  if (!selectionParentEntry) return;

  const [, path] = selectionParentEntry;

  insertNodes<TExcalidrawElement>(
    editor,
    {
      type: key,
      children: [{ text: '' }],
      ...props,
    },
    { at: path, nextBlock: true, ...(options as any) }
  );
};
