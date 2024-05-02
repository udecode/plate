import { selectEditor } from '@udecode/plate-common';
import {
  type InsertNodesOptions,
  type PlateEditor,
  type Value,
  getBlockAbove,
  getPluginOptions,
  getPluginType,
  getStartPoint,
  insertNodes,
  someNode,
  withoutNormalizing,
} from '@udecode/plate-common/server';

import type { TTableElement, TablePlugin } from '../types';

import { ELEMENT_TABLE } from '../createTablePlugin';
import {
  type GetEmptyTableNodeOptions,
  getEmptyTableNode,
} from '../utils/getEmptyTableNode';

/** Insert table if selection not in table. Select start of table. */
export const insertTable = <V extends Value>(
  editor: PlateEditor<V>,
  {
    colCount = 2,
    header,
    newCellChildren,
    rowCount = 2,
  }: GetEmptyTableNodeOptions = {},
  options: InsertNodesOptions<V> = {}
) => {
  const pluginOptions = getPluginOptions<TablePlugin, V>(editor, ELEMENT_TABLE);

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
          newCellChildren: newCellChildren || pluginOptions?.newCellChildren,
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
