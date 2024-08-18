import {
  type InsertNodesOptions,
  type SlateEditor,
  getBlockAbove,
  getStartPoint,
  insertNodes,
  someNode,
  withoutNormalizing,
} from '@udecode/plate-common';
import { selectEditor } from '@udecode/plate-common/react';

import type { TTableElement } from '../types';

import { TablePlugin } from '../TablePlugin';
import {
  type GetEmptyTableNodeOptions,
  getEmptyTableNode,
} from '../utils/getEmptyTableNode';

/** Insert table if selection not in table. Select start of table. */
export const insertTable = <E extends SlateEditor>(
  editor: E,
  { colCount = 2, header, rowCount = 2 }: GetEmptyTableNodeOptions = {},
  options: InsertNodesOptions<E> = {}
) => {
  withoutNormalizing(editor, () => {
    if (
      !someNode(editor, {
        match: { type: editor.getType(TablePlugin) },
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
          match: { type: editor.getType(TablePlugin) },
        });

        if (!tableEntry) return;

        selectEditor(editor, { at: getStartPoint(editor, tableEntry[1]) });
      }
    }
  });
};
