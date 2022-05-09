import {
  getAboveNode,
  getPluginType,
  insertElements,
  PlateEditor,
  someNode,
  TElement,
  Value,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { ELEMENT_TABLE, ELEMENT_TD, ELEMENT_TH } from '../createTablePlugin';
import { TablePluginOptions } from '../types';
import { getEmptyCellNode } from '../utils/getEmptyCellNode';

export const addColumn = <V extends Value>(
  editor: PlateEditor<V>,
  { header }: TablePluginOptions
) => {
  if (
    someNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const currentCellItem = getAboveNode(editor, {
      match: {
        type: [
          getPluginType(editor, ELEMENT_TH),
          getPluginType(editor, ELEMENT_TD),
        ],
      },
    });

    const currentTableItem = getAboveNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    });

    if (currentCellItem && currentTableItem) {
      const nextCellPath = Path.next(currentCellItem[1]);
      const newCellPath = nextCellPath.slice();
      const replacePathPos = newCellPath.length - 2;
      const currentRowIdx = nextCellPath[replacePathPos];

      currentTableItem[0].children.forEach((row, rowIdx) => {
        newCellPath[replacePathPos] = rowIdx;
        const isHeaderRow =
          header === undefined
            ? (row as TElement).children[0].type ===
              getPluginType(editor, ELEMENT_TH)
            : header;

        insertElements(
          editor,
          getEmptyCellNode(editor, { header: isHeaderRow }),
          {
            at: newCellPath,
            select: rowIdx === currentRowIdx,
          }
        );
      });
    }
  }
};
