import { getAbove, someNode } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor, Path, Transforms } from 'slate';
import { TablePluginOptions } from '../types';
import { getEmptyCellNode } from '../utils/getEmptyCellNode';

export const addColumn = (
  editor: Editor,
  { header }: TablePluginOptions,
  options: SlatePluginsOptions
) => {
  const { table, td, th } = options;

  if (someNode(editor, { match: { type: table.type } })) {
    const currentCellItem = getAbove(editor, {
      match: { type: [td.type, th.type] },
    });

    const currentTableItem = getAbove(editor, { match: { type: table.type } });

    if (currentCellItem && currentTableItem) {
      const nextCellPath = Path.next(currentCellItem[1]);
      const newCellPath = nextCellPath.slice();
      const replacePathPos = newCellPath.length - 2;
      const currentRowIdx = nextCellPath[replacePathPos];

      currentTableItem[0].children.forEach((row, rowIdx) => {
        newCellPath[replacePathPos] = rowIdx;

        Transforms.insertNodes(editor, getEmptyCellNode({ header }, options), {
          at: newCellPath,
          select: rowIdx === currentRowIdx,
        });
      });
    }
  }
};
