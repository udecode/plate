import {
  findNode,
  getBlockAbove,
  getPluginOptions,
  getPluginType,
  insertElements,
  PlateEditor,
  select,
  TElement,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { ELEMENT_TABLE, ELEMENT_TH, ELEMENT_TR } from '../createTablePlugin';
import { insertTableMergeRow } from '../merge/insertTableRow';
import { TablePlugin } from '../types';
import { getCellTypes, getEmptyCellNode } from '../utils/index';

export const insertTableRow = <V extends Value>(
  editor: PlateEditor<V>,
  options: {
    header?: boolean;
    fromRow?: Path;
    /**
     * Exact path of the row to insert the column at.
     * Will overrule `fromRow`.
     */
    at?: Path;
    disableSelect?: boolean;
  } = {}
) => {
  const { disableCellsMerging } = getPluginOptions<TablePlugin, V>(
    editor,
    ELEMENT_TABLE
  );
  if (!disableCellsMerging) {
    return insertTableMergeRow(editor, options);
  }

  const { header, fromRow, at, disableSelect } = options;

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
    match: { type: getPluginType(editor, ELEMENT_TABLE) },
    at: trPath,
  });
  if (!tableEntry) return;

  const { newCellChildren } = getPluginOptions<TablePlugin, V>(
    editor,
    ELEMENT_TABLE
  );

  const getEmptyRowNode = () => ({
    type: getPluginType(editor, ELEMENT_TR),
    children: (trNode.children as TElement[]).map((_, i) =>
      getEmptyCellNode(editor, {
        header:
          header ??
          (tableEntry[0].children as TElement[]).every(
            (n) => n.children[i].type === ELEMENT_TH
          ),
        ...newCellChildren,
      })
    ),
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
