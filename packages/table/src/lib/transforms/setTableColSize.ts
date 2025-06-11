import type { EditorAboveOptions, SlateEditor, TTableElement } from 'platejs';

import { KEYS } from 'platejs';

import { getTableColumnCount } from '../queries/getTableColumnCount';

export const setTableColSize = (
  editor: SlateEditor,
  { colIndex, width }: { colIndex: number; width: number },
  options: EditorAboveOptions = {}
) => {
  const table = editor.api.node<TTableElement>({
    match: { type: KEYS.table },
    ...options,
  });

  if (!table) return;

  const [tableNode, tablePath] = table;

  const colSizes = tableNode.colSizes
    ? [...tableNode.colSizes]
    : Array.from({ length: getTableColumnCount(tableNode) }).fill(0);

  colSizes[colIndex] = width;

  editor.tf.setNodes<TTableElement>({ colSizes }, { at: tablePath });
};
