import {
  type SlateEditor,
  type TElement,
  findNode,
  getBlockAbove,
  getEditorPlugin,
  insertElements,
  select,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Path } from 'slate';

import {
  TableCellHeaderPlugin,
  TablePlugin,
  TableRowPlugin,
} from '../TablePlugin';
import { insertTableMergeRow } from '../merge/insertTableRow';
import { getCellTypes } from '../utils/index';

export const insertTableRow = (
  editor: SlateEditor,
  options: {
    /** Exact path of the row to insert the column at. Will overrule `fromRow`. */
    at?: Path;
    disableSelect?: boolean;
    fromRow?: Path;
    header?: boolean;
  } = {}
) => {
  const { api, getOptions, type } = getEditorPlugin(editor, TablePlugin);

  const { enableMerging } = getOptions();

  if (enableMerging) {
    return insertTableMergeRow(editor, options);
  }

  const { at, disableSelect, fromRow, header } = options;

  const trEntry = fromRow
    ? findNode(editor, {
        at: fromRow,
        match: { type: editor.getType(TableRowPlugin) },
      })
    : getBlockAbove(editor, {
        match: { type: editor.getType(TableRowPlugin) },
      });

  if (!trEntry) return;

  const [trNode, trPath] = trEntry;

  const tableEntry = getBlockAbove(editor, {
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
          (n) => n.children[i].type === editor.getType(TableCellHeaderPlugin)
        );

      return api.create.cell!({
        header: header ?? isHeaderColumn,
      });
    }),
    type: editor.getType(TableRowPlugin),
  });

  withoutNormalizing(editor, () => {
    insertElements(editor, getEmptyRowNode(), {
      at: Path.isPath(at) ? at : Path.next(trPath),
    });
  });

  if (!disableSelect) {
    const cellEntry = getBlockAbove(editor, {
      match: { type: getCellTypes(editor) },
    });

    if (!cellEntry) return;

    const [, nextCellPath] = cellEntry;

    if (Path.isPath(at)) {
      nextCellPath[nextCellPath.length - 2] = at.at(-2)!;
    } else {
      nextCellPath[nextCellPath.length - 2] += 1;
    }

    select(editor, nextCellPath);
  }
};
