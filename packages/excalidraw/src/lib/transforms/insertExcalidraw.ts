import {
  type InsertNodesOptions,
  type SlateEditor,
  type TNodeProps,
  getParentNode,
  insertNodes,
} from '@udecode/plate-common';

import {
  type TExcalidrawElement,
  BaseExcalidrawPlugin,
} from '../BaseExcalidrawPlugin';

export const insertExcalidraw = <E extends SlateEditor>(
  editor: E,
  props: TNodeProps<TExcalidrawElement> = {},
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
      type: editor.getType(BaseExcalidrawPlugin),
      ...props,
    },
    { at: path, nextBlock: true, ...(options as any) }
  );
};
