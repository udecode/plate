import {
  type PlateEditor,
  type TElement,
  type Value,
  findNode,
  getBlockAbove,
  getPluginOptions,
  getPluginType,
  insertElements,
  select,
  withoutNormalizing,
} from '@udecode/plate-common/server';
import { Path } from 'slate';

import type { TablePlugin } from '../types';

import { ELEMENT_TABLE, ELEMENT_TH, ELEMENT_TR } from '../createTablePlugin';
import { insertTableMergeRow } from '../merge/insertTableRow';
import { getCellTypes } from '../utils/index';

export const insertTableRow = <V extends Value>(
  editor: PlateEditor<V>,
  options: {
    /** Exact path of the row to insert the column at. Will overrule `fromRow`. */
    at?: Path;
    disableSelect?: boolean;
    fromRow?: Path;
    header?: boolean;
  } = {}
) => {
  const { cellFactory, enableMerging } = getPluginOptions<TablePlugin, V>(
    editor,
    ELEMENT_TABLE
  );

  if (enableMerging) {
    return insertTableMergeRow(editor, options);
  }

  const { at, disableSelect, fromRow, header } = options;

  const trEntry = fromRow
    ? findNode(editor, {
        at: fromRow,
        match: { type: getPluginType(editor, ELEMENT_TR) },
      })
    : getBlockAbove(editor, {
        match: { type: getPluginType(editor, ELEMENT_TR) },
      });

  if (!trEntry) return;

  const [trNode, trPath] = trEntry;

  const tableEntry = getBlockAbove(editor, {
    at: trPath,
    match: { type: getPluginType(editor, ELEMENT_TABLE) },
  });

  if (!tableEntry) return;

  const getEmptyRowNode = () => ({
    children: (trNode.children as TElement[]).map((_, i) => {
      const hasSingleRow = tableEntry[0].children.length === 1;
      const isHeaderColumn =
        !hasSingleRow &&
        (tableEntry[0].children as TElement[]).every(
          (n) => n.children[i].type === getPluginType(editor, ELEMENT_TH)
        );

      return cellFactory!({
        header: header ?? isHeaderColumn,
      });
    }),
    type: getPluginType(editor, ELEMENT_TR),
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
