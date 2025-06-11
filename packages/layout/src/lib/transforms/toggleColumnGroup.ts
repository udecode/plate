import type { ReplaceNodesOptions, SlateEditor, TElement } from 'platejs';

import { KEYS } from 'platejs';

import { columnsToWidths } from '../utils/columnsToWidths';
import { setColumns } from './setColumns';

export const toggleColumnGroup = (
  editor: SlateEditor,
  {
    at,
    columns = 2,
    widths,
  }: Partial<ReplaceNodesOptions> & {
    columns?: number;
    widths?: string[];
  } = {}
) => {
  const entry = editor.api.block({ at });
  const columnGroupEntry = editor.api.block({
    above: true,
    at,
    match: { type: editor.getType(KEYS.columnGroup) },
  });

  if (!entry) return;

  const [node, path] = entry;

  // Check if the node is already a column_group
  if (columnGroupEntry) {
    // Node is already a column_group, just update the columns using setColumns
    setColumns(editor, { at: columnGroupEntry[1], columns, widths });
  } else {
    // Node is not a column_group, wrap it in a column_group
    const columnWidths = widths || columnsToWidths({ columns });

    const nodes = {
      children: new Array(columns).fill(null).map((_, index) => ({
        children: [index === 0 ? node : editor.api.create.block()],
        type: editor.getType(KEYS.column) as any,
        width: columnWidths[index],
      })),
      type: editor.getType(KEYS.columnGroup) as any,
    } as TElement;

    editor.tf.replaceNodes(nodes, {
      at: path,
    });

    editor.tf.select(editor.api.start(path.concat([0]))!);
  }
};
