import {
  type EditorUpdateTransaction,
  type Element,
  type Path,
  PathApi,
} from '@platejs/plite';
import { type BaseEditor, getEditorPlugin } from '@platejs/core';
import {
  type TTableElement,
  type TTableRowElement,
  KEYS,
} from '@platejs/utils';

import { BaseTablePlugin } from '../BaseTablePlugin';
import { insertTableMergeRow } from '../merge/insertTableRow';

export const insertTableRow = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  options: {
    /**
     * Exact path of the row to insert the column at. Pass the table path to
     * insert at the end of the table. Will overrule `fromRow`.
     */
    at?: Path;
    /** Insert the row before the current row instead of after */
    before?: boolean;
    fromRow?: Path;
    header?: boolean;
    select?: boolean;
  } = {}
) => {
  const { api, getOptions, type } = getEditorPlugin(editor, BaseTablePlugin);

  const { disableMerge } = getOptions();

  if (!disableMerge) {
    return insertTableMergeRow(editor, tx, options);
  }

  const { before, header, select: shouldSelect } = options;
  let { at, fromRow } = options;

  if (at && !fromRow) {
    const table = editor.read.nodes.get<TTableElement>(at)?.[0];

    if (table?.type === editor.getType(KEYS.table)) {
      if (!table.children.length) return;

      fromRow = at.concat(table.children.length - 1);
      at = undefined;
    }
  }

  const trEntry = editor.read.nodes.find<TTableRowElement>({
    at: fromRow,
    match: { type: editor.getType(KEYS.tr) },
  });

  if (!trEntry) return;

  const [trNode, trPath] = trEntry;

  const tableEntry = editor.read.nodes.above<TTableElement>({
    at: trPath,
    match: { type },
  });

  if (!tableEntry) return;

  const getEmptyRowNode = () => ({
    children: (trNode.children as Element[]).map((_, i) => {
      const hasSingleRow = tableEntry[0].children.length === 1;
      const isHeaderColumn =
        !hasSingleRow &&
        (tableEntry[0].children as Element[]).every(
          (n) => n.children[i].type === editor.getType(KEYS.th)
        );

      return api.createCell({
        header: header ?? isHeaderColumn,
      });
    }),
    type: editor.getType(KEYS.tr),
  });

  const insertPath = PathApi.isPath(at)
    ? at
    : before
      ? trPath
      : PathApi.next(trPath);

  tx.nodes.insert(getEmptyRowNode(), { at: insertPath });

  if (shouldSelect) {
    const point = tx.points.start(insertPath);

    if (point) tx.selection.set({ anchor: point, focus: point });
  }
};
