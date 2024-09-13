import {
  type InsertNodesOptions,
  type SlateEditor,
  getBlockAbove,
  getEditorPlugin,
  getStartPoint,
  insertNodes,
  someNode,
  withoutNormalizing,
} from '@udecode/plate-common';
import { selectEditor } from '@udecode/plate-common/react';

import type { TTableElement } from '../../lib/types';

import { BaseTablePlugin } from '../../lib/BaseTablePlugin';
import {
  type GetEmptyTableNodeOptions,
  getEmptyTableNode,
} from '../../lib/utils/getEmptyTableNode';

/** Insert table if selection not in table. Select start of table. */
export const insertTable = <E extends SlateEditor>(
  editor: E,
  { colCount = 2, header, rowCount = 2 }: GetEmptyTableNodeOptions = {},
  options: InsertNodesOptions<E> = {}
) => {
  const { type } = getEditorPlugin(editor, BaseTablePlugin);

  withoutNormalizing(editor, () => {
    if (
      !someNode(editor, {
        match: { type },
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
          match: { type },
        });

        if (!tableEntry) return;

        selectEditor(editor, { at: getStartPoint(editor, tableEntry[1]) });
      }
    }
  });
};
