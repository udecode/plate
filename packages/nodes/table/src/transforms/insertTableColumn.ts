import {
  findNode,
  getBlockAbove,
  getPluginOptions,
  getPluginType,
  insertElements,
  PlateEditor,
  setNodes,
  TElement,
  Value,
  withoutNormalizing,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { ELEMENT_TABLE, ELEMENT_TH } from '../createTablePlugin';
import { TablePlugin, TTableElement } from '../types';
import { getEmptyCellNode } from '../utils/getEmptyCellNode';
import { getCellTypes } from '../utils/index';

export const insertTableColumn = <V extends Value>(
  editor: PlateEditor<V>,
  {
    disableSelect,
    fromCell,
    at,
    header,
  }: {
    header?: boolean;

    /**
     * Path of the cell to insert the column from.
     */
    fromCell?: Path;

    /**
     * Exact path of the cell to insert the column at.
     * Will overrule `fromCell`.
     */
    at?: Path;

    /**
     * Disable selection after insertion.
     */
    disableSelect?: boolean;
  } = {}
) => {
  const cellEntry = fromCell
    ? findNode(editor, {
        at: fromCell,
        match: { type: getCellTypes(editor) },
      })
    : getBlockAbove(editor, {
        match: { type: getCellTypes(editor) },
      });
  if (!cellEntry) return;

  const [, cellPath] = cellEntry;

  const tableEntry = getBlockAbove<TTableElement>(editor, {
    match: { type: getPluginType(editor, ELEMENT_TABLE) },
    at: cellPath,
  });
  if (!tableEntry) return;

  const [tableNode, tablePath] = tableEntry;

  let nextCellPath: Path;
  let nextColIndex: number;

  if (Path.isPath(at)) {
    nextCellPath = at;
    nextColIndex = at[at.length - 1];
  } else {
    nextCellPath = Path.next(cellPath);
    nextColIndex = cellPath[cellPath.length - 1] + 1;
  }
  const currentRowIndex = cellPath[cellPath.length - 2];

  const { newCellChildren, initialTableWidth } = getPluginOptions<
    TablePlugin,
    V
  >(editor, ELEMENT_TABLE);

  withoutNormalizing(editor, () => {
    // for each row, insert a new cell
    tableNode.children.forEach((row, rowIndex) => {
      const insertCellPath = [...nextCellPath];
      if (Path.isPath(at)) {
        insertCellPath[at.length - 2] = rowIndex;
      } else {
        insertCellPath[cellPath.length - 2] = rowIndex;
      }

      const isHeaderRow =
        header === undefined
          ? (row as TElement).children[0].type ===
            getPluginType(editor, ELEMENT_TH)
          : header;

      insertElements(
        editor,
        getEmptyCellNode(editor, {
          header: isHeaderRow,
          newCellChildren,
        }),
        {
          at: insertCellPath,
          select: !disableSelect && rowIndex === currentRowIndex,
        }
      );
    });

    const { colSizes } = tableNode;

    if (colSizes) {
      let nextColSize = 0;

      if (initialTableWidth) {
        nextColSize = colSizes[nextColIndex];

        if (!nextColSize) {
          nextColSize =
            colSizes[nextColIndex - 1] || initialTableWidth / colSizes.length;
        }
      }

      setNodes<TTableElement>(
        editor,
        {
          colSizes: [
            ...colSizes.slice(0, nextColIndex),
            nextColSize,
            ...colSizes.slice(nextColIndex),
          ],
        },
        {
          at: tablePath,
        }
      );
    }
  });
};
