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

import { getRowSpan } from '../components/TableCellElement/getRowSpan';
import { ELEMENT_TABLE, ELEMENT_TR } from '../createTablePlugin';
import { getTableColumnCount } from '../queries';
import * as types from '../types';
import { getCellTypes, getEmptyRowNode } from '../utils/index';

export const insertTableRow = <V extends Value>(
  editor: PlateEditor<V>,
  {
    header,
    fromRow,
    at,
    disableSelect,
  }: {
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
  const trEntry = fromRow
    ? findNode(editor, {
        at: fromRow,
        match: { type: getPluginType(editor, ELEMENT_TR) },
      })
    : getBlockAbove(editor, {
        match: { type: getPluginType(editor, ELEMENT_TR) },
      });
  if (!trEntry) return;

  const [, trPath] = trEntry;

  const tableEntry = getBlockAbove(editor, {
    match: { type: getPluginType(editor, ELEMENT_TABLE) },
    at: trPath,
  });
  if (!tableEntry) return;

  const { newCellChildren } = getPluginOptions<types.TablePlugin, V>(
    editor,
    ELEMENT_TABLE
  );

  const currentCellEntry = findNode(editor, {
    at: fromRow,
    match: { type: getCellTypes(editor) },
  });
  if (!currentCellEntry) return;

  const [cellNode] = currentCellEntry;
  const cellElement = cellNode as types.TTableCellElement;
  const rowSpan = getRowSpan(cellElement);

  // consider merged cell with rowSpan > 1
  const rowIndex = trPath.at(-1)!; // TODO: improve typing
  const updateTrPath = [...trPath.slice(0, -1), rowIndex + rowSpan - 1];

  withoutNormalizing(editor, () => {
    insertElements(
      editor,
      getEmptyRowNode(editor, {
        header,
        colCount: getTableColumnCount(tableEntry[0] as TElement),
        newCellChildren,
      }),
      {
        at: Path.isPath(at) ? at : Path.next(updateTrPath),
      }
    );
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
