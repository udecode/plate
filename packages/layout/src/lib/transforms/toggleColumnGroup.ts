import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateTransaction,
  Element,
  Location,
} from '@platejs/plite';
import { PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { columnsToWidths } from '../utils/columnsToWidths';
import { setColumns } from './setColumns';

export type ToggleColumnGroupOptions = {
  at?: Location;
  columns?: number;
  widths?: string[];
};

export const toggleColumnGroup = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { at, columns = 2, widths }: ToggleColumnGroupOptions = {}
) => {
  const entry = tx.nodes.block<Element>({ at });
  const columnGroupEntry = tx.nodes.above<Element>({
    at,
    match: { type: editor.getType(KEYS.columnGroup) },
  });

  if (!entry) return;

  const [node, path] = entry;

  // Check if the node is already a column_group
  if (columnGroupEntry) {
    // Node is already a column_group, just update the columns using setColumns
    setColumns(editor, tx, { at: columnGroupEntry[1], columns, widths });
  } else {
    // Node is not a column_group, wrap it in a column_group
    const columnWidths = widths || columnsToWidths({ columns });

    const columnGroup = {
      children: new Array(columns).fill(null).map((_, index) => ({
        children: [
          index === 0
            ? node
            : { children: [{ text: '' }], type: editor.getType(KEYS.p) },
        ],
        type: editor.getType(KEYS.column),
        width: columnWidths[index],
      })),
      type: editor.getType(KEYS.columnGroup),
    };
    const parentPath = PathApi.parent(path);
    const index = path.at(-1);

    if (index === undefined) return;

    tx.nodes.replaceChildren([columnGroup], {
      at: parentPath,
      count: 1,
      index,
    });

    const point = tx.points.start(path.concat([0]));

    if (point) {
      tx.selection.set(point);
    }
  }
};
