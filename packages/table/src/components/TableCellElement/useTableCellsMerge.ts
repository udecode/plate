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

    // console.log(
    //   'settings',
    //   colSpan,
    //   rowSpan,
    //   lastRowIndex,
    //   firstRowIndex,
    //   lastColIndex
    // );

    const contents = [];
    for (const cellEntry of selectedCellEntries) {
      const [el, path] = cellEntry;
      const [rowIndex, colIndex] = path.slice(-2);
      const cellElement: TTableCellElement = el;

      contents.push(...el.children);

      if (rowIndex === firstRowIndex && colIndex === lastColIndex) {
        removeNodes(editor, { at: path });
        insertNodes<TTableCellElement>(
          editor,
          {
            ...getEmptyCellNode(editor, {
              header: cellElement.type === 'th',
              newCellChildren: contents, // TODO: update content
            }),
            colSpan,
            rowSpan,
          },
          { at: path }
        );
      } else {
        removeNodes(editor, { at: path });
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
    console.log('contents', contents);
  };

  return { onMergeCells };
};
