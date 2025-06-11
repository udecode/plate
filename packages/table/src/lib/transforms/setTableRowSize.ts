import type {
  EditorAboveOptions,
  SlateEditor,
  TTableElement,
  TTableRowElement,
} from '@udecode/plate';

import { KEYS } from '@udecode/plate';

export const setTableRowSize = (
  editor: SlateEditor,
  { height, rowIndex }: { height: number; rowIndex: number },
  options: EditorAboveOptions = {}
) => {
  const table = editor.api.node<TTableElement>({
    match: { type: KEYS.table },
    ...options,
  });

  if (!table) return;

  const [, tablePath] = table;
  const tableRowPath = [...tablePath, rowIndex];

  editor.tf.setNodes<TTableRowElement>({ size: height }, { at: tableRowPath });
};
