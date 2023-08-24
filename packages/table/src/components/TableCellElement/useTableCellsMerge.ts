import {
  insertElements,
  removeNodes,
  TDescendant,
  usePlateEditorState,
} from '@udecode/plate-common';

import { getTableGridAbove } from '../../queries';
import { getEmptyCellNode } from '../../utils/index';
import { getColSpan } from './getColSpan';
import { getRowSpan } from './getRowSpan';

export const useTableCellsMerge = () => {
  const editor = usePlateEditorState();
  const cellEntries = getTableGridAbove(editor, { format: 'cell' });

  const onMergeCells = () => {
    // define colSpan
    const colSpan = cellEntries.reduce((acc, [data, path]: any) => {
      if (path[1] === cellEntries[0][1][1]) {
        const cellColSpan = getColSpan(data);
        return acc + cellColSpan;
      }
      return acc;
    }, 0);

    // define rowSpan
    const alreadyCounted: number[] = [];
    const rowSpan = cellEntries.reduce((acc, [data, path]: any) => {
      const curRowCounted = alreadyCounted.includes(path[1]);
      if (path[1] !== cellEntries[0][1][1] && !curRowCounted) {
        alreadyCounted.push(path[1]);

        const cellRowSpan = getRowSpan(data);
        return acc + cellRowSpan;
      }
      return acc;
    }, 1);

    const contents = [];
    for (const cellEntry of cellEntries) {
      const [el] = cellEntry;
      contents.push(...el.children); // TODO: make deep clone here
    }

    const cols: { [key: string]: number[][] } = {};
    let hasHeaderCell = false;
    cellEntries.forEach(([entry, path]) => {
      if (!hasHeaderCell && entry.type === 'table_header_cell') {
        hasHeaderCell = true;
      }
      if (cols[path[1]]) {
        cols[path[1]].push(path);
      } else {
        cols[path[1]] = [path];
      }
    });

    // removes multiple cells with on same path.
    // once cell removed, next cell in the row will settle down on that path
    Object.values(cols).forEach((paths) => {
      paths?.forEach(() => {
        removeNodes(editor, { at: paths[0] });
      });
    });

    const mergedCell = {
      ...getEmptyCellNode(editor, {
        header: cellEntries[0][0].type === 'th',
        newCellChildren: contents,
      }),
      colSpan,
      rowSpan,
    };

    insertElements(editor, mergedCell, { at: cellEntries[0][1] });
  };

  const onUnmerge = () => {
    const [[cellElem, path]] = cellEntries;

    // creating new object per iteration is essential here
    const createEmptyCell = (children?: TDescendant[]) => {
      return {
        ...getEmptyCellNode(editor, {
          header: cellElem.type === 'th',
          newCellChildren: children,
        }),
        colSpan: 1,
        rowSpan: 1,
      };
    };

    const tablePath = path.slice(0, -2);

    const cellPath = path.slice(-2);
    const [rowPath, colPath] = cellPath;
    const colSpan = cellElem.colSpan;
    const rowSpan = cellElem.rowSpan;

    const colPaths = Array.from(
      { length: colSpan } as ArrayLike<number>,
      (_, index) => {
        return index;
      }
    ).map((current) => {
      return colPath + current;
    });

    removeNodes(editor, { at: path });

    Array.from({ length: rowSpan } as ArrayLike<number>, (_, index) => {
      return index;
    })
      .flatMap((current) => {
        const currentRowPath = rowPath + current;
        return colPaths.map((currentColPath) => [
          ...tablePath,
          currentRowPath,
          currentColPath,
        ]);
      })
      .forEach((p, index) =>
        insertElements(
          editor,
          index === 0 ? createEmptyCell(cellElem.children) : createEmptyCell(),
          { at: p }
        )
      );
  };

  return { onMergeCells, onUnmerge };
};
