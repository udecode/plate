import {
  getRange,
  insertElements,
  removeNodes,
  usePlateEditorState,
} from '@udecode/plate-common';
import { Path } from 'slate';

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
      // currentRowIndex: lastRowIndex,
      // currentColIndex: lastColIndex
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

    // const firstRowIndex = lastRowIndex + 1 - rowSpan;
    // console.log(
    //   'settings:',
    //   'rowSpan',
    //   rowSpan,
    //   'colSpan',
    //   colSpan,
    //   'lastRowIndex',
    //   lastRowIndex,
    //   'firstRowIndex',
    //   firstRowIndex
    // );

    const contents = [];

    const paths: Path[] = [];
    for (const cellEntry of selectedCellEntries) {
      const [el, path] = cellEntry;
      paths.push(path);
      contents.push(...el.children);
    }

    removeNodes(editor, {
      at: getRange(editor, paths.at(0)!, paths.at(-1)!),
      match: (_, path) => {
        if (paths.some((p) => Path.equals(p, path))) {
          return true;
        }
        return false;
      },
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
