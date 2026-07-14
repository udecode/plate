import type { Descendant, EditorUpdateTransaction, Path } from '@platejs/plite';
import type { BaseEditor } from '@platejs/core';
import type { TTableCellElement, TTableRowElement } from '@platejs/utils';

import { getEditorPlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { getCellIndices } from '..';
import { BaseTablePlugin } from '../BaseTablePlugin';
import { getTableGridAbove } from '../queries';

export const splitTableCell = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction
) => {
  const { api } = getEditorPlugin(editor, BaseTablePlugin);
  const tableRowType = editor.getType(KEYS.tr);

  const cellEntries = getTableGridAbove(editor, { format: 'cell' });
  const firstCell = cellEntries[0];

  if (!firstCell) return;

  const [cellElem, path] = firstCell;

  tx.withoutNormalizing(({ tx }) => {
    // creating new object per iteration is essential here
    const createEmptyCell = (children?: Descendant[]) => ({
      ...api.createCell({
        children,
        header: cellElem.type === editor.getType(KEYS.th),
      }),
      colSpan: 1,
      rowSpan: 1,
    });

    const tablePath = path.slice(0, -2);

    const cellPath = path.slice(-2);
    const [rowPath, colPath] = cellPath;
    const colSpan = api.getColSpan(cellElem);
    const rowSpan = api.getRowSpan(cellElem);

    // Generate an array of column paths from the colspan
    const colPaths: number[] = [];

    for (let i = 0; i < colSpan; i++) {
      colPaths.push(colPath + i);
    }

    const { col } = getCellIndices(editor, cellElem);

    // Remove the original merged cell from the editor
    tx.nodes.remove({ at: path });

    const getClosestColPathForRow = (row: number, targetCol: number) => {
      const rowEntry = tx.nodes.get<TTableRowElement>([...tablePath, row]);

      if (!rowEntry || rowEntry[0].type !== tableRowType) {
        return 0;
      }

      const rowEl = rowEntry[0];
      let closestColPath: Path = [];
      let smallestDiff = Number.POSITIVE_INFINITY;
      let isDirectionLeft = false;

      rowEl.children.forEach((cell) => {
        const cellElement = cell as TTableCellElement;
        const { col: cellCol } = getCellIndices(editor, cellElement);

        const diff = Math.abs(cellCol - targetCol);

        if (diff < smallestDiff) {
          const cellPath = tx.nodes.path(cellElement);

          if (!cellPath) return;

          smallestDiff = diff;
          closestColPath = cellPath;
          isDirectionLeft = cellCol < targetCol;
        }
      });

      if (closestColPath.length > 0) {
        const lastIndex = closestColPath.at(-1)!;

        if (isDirectionLeft) {
          return lastIndex + 1;
        }

        return lastIndex;
      }

      return 1;
    };

    // Generate an array of cell paths from the row and col spans and then insert empty cells at those paths
    for (let i = 0; i < rowSpan; i++) {
      const currentRowPath = rowPath + i;
      const pathForNextRows = getClosestColPathForRow(currentRowPath, col);
      const newRowChildren: TTableRowElement[] = [];
      const _rowPath = [...tablePath, currentRowPath];
      const rowEntry = tx.nodes.get<TTableRowElement>(_rowPath);

      for (let j = 0; j < colPaths.length; j++) {
        const cellChildren = api.getCellChildren!(cellElem);

        const cellToInsert =
          i === 0 && j === 0
            ? createEmptyCell(cellChildren)
            : createEmptyCell();

        // if row exists, insert into it, otherwise insert row
        if (rowEntry) {
          const currentColPath = i === 0 ? colPaths[j] : pathForNextRows;
          const pathForNewCell = [...tablePath, currentRowPath, currentColPath];

          tx.nodes.insert(cellToInsert, { at: pathForNewCell });
        } else {
          newRowChildren.push(cellToInsert);
        }
      }

      if (!rowEntry) {
        tx.nodes.insert(
          {
            children: newRowChildren,
            type: editor.getType(KEYS.tr),
          },
          { at: _rowPath }
        );
      }
    }
  });

  const point = tx.points.end(path);

  if (point) tx.selection.set(point);
};
