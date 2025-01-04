import {
  type SlateEditor,
  type TElement,
  getEditorPlugin,
  getLastChildPath,
  getNode,
  insertElements,
} from '@udecode/plate-common';
import { Path } from 'slate';

import type { TTableElement } from '../types';

import {
  BaseTableCellHeaderPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '../BaseTablePlugin';
import { insertTableMergeRow } from '../merge/insertTableRow';
import { getCellTypes } from '../utils/index';

export const insertTableRow = (
  editor: SlateEditor,
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
    return insertTableMergeRow(editor, options);
  }

  const { before, header, select: shouldSelect } = options;
  let { at, fromRow } = options;

  if (at && !fromRow) {
    const table = getNode<TTableElement>(editor, at);

    if (table?.type === editor.getType(BaseTablePlugin)) {
      fromRow = getLastChildPath([table, at]);
      at = undefined;
    }
  }

  const trEntry = fromRow
    ? editor.api.find({
        at: fromRow,
        match: { type: editor.getType(BaseTableRowPlugin) },
      })
    : editor.api.block({
        match: { type: editor.getType(BaseTableRowPlugin) },
      });

  if (!trEntry) return;

  const [trNode, trPath] = trEntry;

  const tableEntry = editor.api.block({
    at: trPath,
    match: { type },
  });

  if (!tableEntry) return;

  const getEmptyRowNode = () => ({
    children: (trNode.children as TElement[]).map((_, i) => {
      const hasSingleRow = tableEntry[0].children.length === 1;
      const isHeaderColumn =
        !hasSingleRow &&
        (tableEntry[0].children as TElement[]).every(
          (n) =>
            n.children[i].type === editor.getType(BaseTableCellHeaderPlugin)
        );

      return api.create.tableCell({
        header: header ?? isHeaderColumn,
      });
    }),
    type: editor.getType(BaseTableRowPlugin),
  });

  editor.tf.withoutNormalizing(() => {
    insertElements(editor, getEmptyRowNode(), {
      at: Path.isPath(at) ? at : before ? trPath : Path.next(trPath),
    });
  });

  if (shouldSelect) {
    const cellEntry = editor.api.block({
      match: { type: getCellTypes(editor) },
    });

    if (!cellEntry) return;

    const [, nextCellPath] = cellEntry;

    if (Path.isPath(at)) {
      nextCellPath[nextCellPath.length - 2] = at.at(-2)!;
    } else {
      nextCellPath[nextCellPath.length - 2] = before
        ? nextCellPath.at(-2)!
        : nextCellPath.at(-2)! + 1;
    }

    editor.tf.select(nextCellPath);
  }
};
