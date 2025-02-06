import {
  type Path,
  type SlateEditor,
  type TElement,
  getEditorPlugin,
  NodeApi,
  PathApi,
} from '@udecode/plate';

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
    const table = NodeApi.get<TTableElement>(editor, at);

    if (table?.type === editor.getType(BaseTablePlugin)) {
      fromRow = NodeApi.lastChild(editor, at)![1];
      at = undefined;
    }
  }

  const trEntry = editor.api.block({
    at: fromRow,
    match: { type: editor.getType(BaseTableRowPlugin) },
  });

  if (!trEntry) return;

  const [trNode, trPath] = trEntry;

  const tableEntry = editor.api.block({
    above: true,
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
    editor.tf.insertNodes(getEmptyRowNode(), {
      at: PathApi.isPath(at) ? at : before ? trPath : PathApi.next(trPath),
    });
  });

  if (shouldSelect) {
    const cellEntry = editor.api.block({
      match: { type: getCellTypes(editor) },
    });

    if (!cellEntry) return;

    const [, nextCellPath] = cellEntry;

    if (PathApi.isPath(at)) {
      nextCellPath[nextCellPath.length - 2] = at.at(-2)!;
    } else {
      nextCellPath[nextCellPath.length - 2] = before
        ? nextCellPath.at(-2)!
        : nextCellPath.at(-2)! + 1;
    }

    editor.tf.select(nextCellPath);
  }
};
