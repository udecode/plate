import { selectEditor } from '@udecode/plate-common';
import {
  type InsertNodesOptions,
  type PlateEditor,
  type Value,
  getBlockAbove,
  getPluginType,
  getStartPoint,
  insertNodes,
  someNode,
  withoutNormalizing,
} from '@udecode/plate-common/server';

import type { TTableElement } from '../types';

import { ELEMENT_TABLE } from '../TablePlugin';
import {
  type GetEmptyTableNodeOptions,
  getEmptyTableNode,
} from '../utils/getEmptyTableNode';

/** Insert table if selection not in table. Select start of table. */
export const insertTable = <V extends Value>(
  editor: PlateEditor<V>,
  { colCount = 2, header, rowCount = 2 }: GetEmptyTableNodeOptions = {},
  options: InsertNodesOptions<V> = {}
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
