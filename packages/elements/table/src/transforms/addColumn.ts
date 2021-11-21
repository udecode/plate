import {
  getAbove,
  getPluginType,
  insertNodes,
  PlateEditor,
  someNode,
  TElement,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { ELEMENT_TABLE, ELEMENT_TD, ELEMENT_TH } from '../createTablePlugin';
import { TablePluginOptions } from '../types';
import { getEmptyCellNode } from '../utils/getEmptyCellNode';

export const addColumn = (
  editor: PlateEditor,
  { header }: TablePluginOptions
) => {
  if (
    someNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const currentCellItem = getAbove(editor, {
      match: {
        type: [
          getPluginType(editor, ELEMENT_TH),
          getPluginType(editor, ELEMENT_TD),
        ],
      },
    });

    const currentTableItem = getAbove(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    });

    if (currentCellItem && currentTableItem) {
      const nextCellPath = Path.next(currentCellItem[1]);
      const newCellPath = nextCellPath.slice();
      const replacePathPos = newCellPath.length - 2;
      const currentRowIdx = nextCellPath[replacePathPos];

      currentTableItem[0].children.forEach((row: TElement, rowIdx) => {
        newCellPath[replacePathPos] = rowIdx;
        const isHeaderRow =
          header === undefined ? row.children[0].type === ELEMENT_TH : header;

        insertNodes<TElement>(
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
