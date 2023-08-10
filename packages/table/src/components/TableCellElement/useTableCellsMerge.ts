import {
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
      currentColIndex: lastColIndex,
    } = selectedCellEntries.reduce(
      (acc, current) => {
        const [el, path] = current;
        const cellElement: TTableCellElement = el;
        const [rowIndex, colIndex] = path.slice(-2);

        if (acc.currentRowIndex !== rowIndex) {
          acc.rowSpan += cellElement.rowSpan || 1;
          acc.currentRowIndex = rowIndex;
        }

        if (colIndex > acc.currentColIndex) {
          acc.colSpan += cellElement.colSpan || 1;
          acc.currentColIndex = colIndex;
        }

        return acc;
      },
      { colSpan: 0, rowSpan: 0, currentRowIndex: 0, currentColIndex: 0 }
    );

    const firstRowIndex = lastRowIndex + 1 - rowSpan;
    //TODO: fix rowIndex
    // TODO: fix resize for right handle
    // console.log(
    //   'settings',
    //   colSpan,
    //   rowSpan,
    //   lastRowIndex,
    //   firstRowIndex,
    //   lastColIndex
    // );

    const contents = [];

    const latInFirstRow = selectedCellEntries.find(([el, path]) => {
      const [rowIndex, colIndex] = path.slice(-2);
      if (rowIndex === firstRowIndex && colIndex === lastColIndex) {
        return true;
      }
      return false;
    })!;

    for (const cellEntry of selectedCellEntries) {
      const [el, path] = cellEntry;
      const cellElement: TTableCellElement = el;

      contents.push(...el.children);

      removeNodes(editor, { at: path });
      if (cellEntry !== latInFirstRow) {
        insertNodes(
          editor,
          {
            ...getEmptyCellNode(editor, {
              header: cellElement.type === 'th',
            }),
            merged: true,
          },
          { at: path }
        );
      } 
    }

    insertNodes<TTableCellElement>(
      editor,
      {
        ...getEmptyCellNode(editor, {
          header: latInFirstRow[0].type === 'th',
          newCellChildren: contents, // TODO: update content
        }),
        colSpan,
        // rowSpan,
      },
      { at: latInFirstRow[1] }
    );

    // console.log('contents 2', contents);
  };

  return { onMergeCells };
};
