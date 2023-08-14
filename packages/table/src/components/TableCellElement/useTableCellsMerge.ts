import {
  insertElements,
  insertNodes,
  removeNodes,
  usePlateEditorState,
} from '@udecode/plate-common';

import { useTableStore } from '../../stores/index';
import { TTableCellElement } from '../../types';
import { getEmptyCellNode } from '../../utils/index';

export const useTableCellsMerge = () => {
  const editor = usePlateEditorState();
  const selectedCellEntries = useTableStore().get.selectedCellEntries() || [];
  const onMergeCells = () => {
    const {
      colSpan,
      rowSpan,
      currentRowIndex: lastRowIndex,
    } = selectedCellEntries.reduce(
      (acc, current, index) => {
        const [el, path] = current;
        const cellElement: TTableCellElement = el;
        const [rowIndex, colIndex] = path.slice(-2);

        if (acc.currentRowIndex !== rowIndex || index === 0) {
          acc.rowSpan += cellElement.rowSpan || 1;
          acc.currentRowIndex = rowIndex;
        }

        if (colIndex > acc.currentColIndex || index === 0) {
          acc.colSpan += cellElement.colSpan || 1;
          acc.currentColIndex = colIndex;
        }

        return acc;
      },
      {
        colSpan: 0,
        rowSpan: 0,
        currentRowIndex: 0,
        currentColIndex: 0,
      }
    );

    const firstRowIndex = lastRowIndex + 1 - rowSpan;

    console.log(
      'settings:',
      'rowSpan',
      rowSpan,
      'colSpan',
      colSpan,
      'lastRowIndex',
      lastRowIndex,
      'firstRowIndex',
      firstRowIndex
    );

    const contents = [];

    for (const cellEntry of selectedCellEntries) {
      const [el] = cellEntry;

      contents.push(...el.children);
    }

    // cols to remove
    const cols: any = {};
    let hasHeaderCell = false;
    selectedCellEntries.forEach(([entry, path]) => {
      if (!hasHeaderCell && entry.type === 'table_header_cell') {
        hasHeaderCell = true;
      }
      if (cols[path[1]]) {
        cols[path[1]].push(path);
      } else {
        cols[path[1]] = [path];
      }
    });

    Object.values(cols).forEach((paths: any) => {
      paths?.forEach(() => {
        removeNodes(editor, { at: paths[0] });
      });
    });

    const mergedCell = {
      ...getEmptyCellNode(editor, {
        header: selectedCellEntries[0][0].type === 'th',
        newCellChildren: contents,
      }),
      colSpan,
      rowSpan,
    };

    insertElements(editor, mergedCell, { at: selectedCellEntries[0][1] });
  };

  return { onMergeCells };
};
