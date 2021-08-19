import { getAbove, insertNodes, someNode } from '@udecode/plate-common';
import { getPlatePluginType, SPEditor, TElement } from '@udecode/plate-core';
import { Path } from 'slate';
import { ELEMENT_TABLE, ELEMENT_TD, ELEMENT_TH } from '../defaults';
import { TablePluginOptions } from '../types';
import { getEmptyCellNode } from '../utils/getEmptyCellNode';

export const addColumn = (editor: SPEditor, { header }: TablePluginOptions) => {
  if (
    someNode(editor, {
      match: { type: getPlatePluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const currentCellItem = getAbove(editor, {
      match: {
        type: [
          getPlatePluginType(editor, ELEMENT_TD),
          getPlatePluginType(editor, ELEMENT_TH),
        ],
      },
    });

    const currentTableItem = getAbove(editor, {
      match: { type: getPlatePluginType(editor, ELEMENT_TABLE) },
    });

    if (currentCellItem && currentTableItem) {
      const nextCellPath = Path.next(currentCellItem[1]);
      const newCellPath = nextCellPath.slice();
      const replacePathPos = newCellPath.length - 2;
      const currentRowIdx = nextCellPath[replacePathPos];

      currentTableItem[0].children.forEach((row, rowIdx) => {
        newCellPath[replacePathPos] = rowIdx;

        insertNodes<TElement>(editor, getEmptyCellNode(editor, { header }), {
          at: newCellPath,
          select: rowIdx === currentRowIdx,
        });
      });
    }
  }
};
