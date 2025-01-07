import {
  type Descendant,
  type Path,
  type SlateEditor,
  getEditorPlugin,
} from '@udecode/plate';

import {
  type TTableCellElement,
  type TTableRowElement,
  getCellIndices,
} from '..';
import {
  BaseTableCellHeaderPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '../BaseTablePlugin';
import { getTableGridAbove } from '../queries';

export const splitTableCell = (editor: SlateEditor) => {
  const { api } = getEditorPlugin(editor, BaseTablePlugin);
  const tableRowType = editor.getType(BaseTableRowPlugin);

  const cellEntries = getTableGridAbove(editor, { format: 'cell' });
  const [[cellElem, path]] = cellEntries;

  editor.tf.withoutNormalizing(() => {
    // creating new object per iteration is essential here
    const createEmptyCell = (children?: Descendant[]) => {
      return {
        ...api.create.tableCell({
          children,
          header: cellElem.type === editor.getType(BaseTableCellHeaderPlugin),
        }),
        colSpan: 1,
        rowSpan: 1,
      };
    };

    const tablePath = path.slice(0, -2);

    const cellPath = path.slice(-2);
    const [rowPath, colPath] = cellPath;
    const colSpan = api.table.getColSpan(cellElem);
    const rowSpan = api.table.getRowSpan(cellElem);

    // Generate an array of column paths from the colspan
    const colPaths: number[] = [];

    for (let i = 0; i < colSpan; i++) {
      colPaths.push(colPath + i);
    }

    const { col } = getCellIndices(editor, cellElem);

    // Remove the original merged cell from the editor
    editor.tf.removeNodes({ at: path });

    const getClosestColPathForRow = (row: number, targetCol: number) => {
      const rowEntry = editor.api.node({
        at: [...tablePath, row],
        match: { type: tableRowType },
      });

      if (!rowEntry) {
        return 0;
      }

      const rowEl = rowEntry[0] as TTableRowElement;
      let closestColPath: Path = [];
      let smallestDiff = Number.POSITIVE_INFINITY;
      let isDirectionLeft = false;

      rowEl.children.forEach((cell) => {
        const cellElement = cell as TTableCellElement;
        const { col: cellCol } = getCellIndices(editor, cellElement);

        const diff = Math.abs(cellCol - targetCol);

        if (diff < smallestDiff) {
          smallestDiff = diff;
          closestColPath = editor.api.findPath(cellElement)!;
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
      const rowEntry = editor.api.node({
        at: _rowPath,
        match: { type: tableRowType },
      });

      for (let j = 0; j < colPaths.length; j++) {
        const cellChildren = api.table.getCellChildren!(cellElem);

        const cellToInsert =
          i === 0 && j === 0
            ? createEmptyCell(cellChildren)
            : createEmptyCell();

        // if row exists, insert into it, otherwise insert row
        if (rowEntry) {
          const currentColPath = i === 0 ? colPaths[j] : pathForNextRows;
          const pathForNewCell = [...tablePath, currentRowPath, currentColPath];

          editor.tf.insertNodes(cellToInsert, { at: pathForNewCell });
        } else {
          newRowChildren.push(cellToInsert);
        }
      }

      if (!rowEntry) {
        editor.tf.insertNodes(
          {
            children: newRowChildren,
            type: editor.getType(BaseTableRowPlugin),
          },
          { at: _rowPath }
        );
      }
    }
  });

  editor.tf.select(editor.api.end(path)!);
};
