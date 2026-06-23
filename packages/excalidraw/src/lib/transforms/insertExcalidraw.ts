import type { NodeInsertNodesOptions, NodeProps, SlateEditor } from 'platejs';

import { KEYS, PathApi } from 'platejs';

import type { ExcalidrawElement } from '../BaseExcalidrawPlugin';

export type InsertExcalidrawOptions = NonNullable<
  NodeInsertNodesOptions<ExcalidrawElement>
>;

export const insertExcalidraw = (
  editor: SlateEditor,
  props: NodeProps<ExcalidrawElement> = {},
  options: InsertExcalidrawOptions = {}
): void => {
  if (!editor.selection) return;

  const selectionParentEntry = editor.api.parent(editor.selection);

  if (!selectionParentEntry) return;

  const [, path] = selectionParentEntry;
  const at = options.at ?? PathApi.next(path);

  editor.update((tx) => {
    tx.nodes.insert<ExcalidrawElement>(
      {
        children: [{ text: '' }],
        type: editor.getType(KEYS.excalidraw),
        ...props,
      },
      { ...options, at }
    );
  });
};
