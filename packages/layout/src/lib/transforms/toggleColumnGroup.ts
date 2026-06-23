import type { EditorUpdateTransaction } from '@platejs/slate';
import type { TColumnGroupElement } from 'platejs';

import { KEYS } from 'platejs';

import { columnsToWidths } from '../utils/columnsToWidths';
import { type ColumnEditor, createColumnBlock } from './ColumnEditor';
import { setColumns } from './setColumns';

export type ToggleColumnGroupNodeOptions = NonNullable<
  Parameters<EditorUpdateTransaction['nodes']['insert']>[1]
>;

export const toggleColumnGroup = (
  editor: ColumnEditor,
  {
    at,
    columns = 2,
    widths,
  }: Partial<ToggleColumnGroupNodeOptions> & {
    columns?: number;
    widths?: string[];
  } = {}
) => {
  const entry = editor.api.block({ at });
  const columnGroupEntry = editor.api.block({
    above: true,
    at,
    match: (node: unknown) =>
      typeof node === 'object' &&
      node !== null &&
      'type' in node &&
      node.type === editor.getType(KEYS.columnGroup),
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
        children: [index === 0 ? node : createColumnBlock(editor)],
        type: editor.getType(KEYS.column) as any,
        width: columnWidths[index],
      })),
      type: editor.getType(KEYS.columnGroup) as any,
    } as TColumnGroupElement;

    editor.update((tx) => {
      tx.withoutNormalizing(() => {
        tx.nodes.remove({ at: path });
        tx.nodes.insert(nodes, {
          at: path,
        });
        tx.selection.set(editor.api.start(path.concat([0]))!);
      });
    });
  }
};
