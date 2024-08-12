import {
  type InsertNodesOptions,
  type PlateEditor,
  type ValueOf,
  getBlockAbove,
  getPluginType,
  getStartPoint,
  insertNodes,
  someNode,
  withoutNormalizing,
} from '@udecode/plate-common';
import { selectEditor } from '@udecode/plate-common/react';

import type { TTableElement } from '../types';

import { ELEMENT_TABLE } from '../TablePlugin';
import {
  type GetEmptyTableNodeOptions,
  getEmptyTableNode,
} from '../utils/getEmptyTableNode';

/** Insert table if selection not in table. Select start of table. */
export const insertTable = <E extends PlateEditor>(
  editor: E,
  { colCount = 2, header, rowCount = 2 }: GetEmptyTableNodeOptions = {},
  options: InsertNodesOptions<ValueOf<E>> = {}
) => {
  withoutNormalizing(editor, () => {
    if (
      !someNode(editor, {
        match: { type: getPluginType(editor, ELEMENT_TABLE) },
      })
    ) {
      insertNodes<TTableElement>(
        editor,
        getEmptyTableNode(editor, {
          colCount,
          header,
          rowCount,
        }),
        {
          nextBlock: true,
          ...(options as any),
        }
      );

      if (editor.selection) {
        const tableEntry = getBlockAbove(editor, {
          match: { type: getPluginType(editor, ELEMENT_TABLE) },
        });

        if (!tableEntry) return;

        selectEditor(editor, { at: getStartPoint(editor, tableEntry[1]) });
      }
    }
  });
};
