import {
  getAboveNode,
  getPluginType,
  getStartPoint,
  insertNodes,
  PlateEditor,
  selectEditor,
  someNode,
  Value,
} from '@udecode/plate-core';
import { ELEMENT_TABLE } from '../createTablePlugin';
import { TablePluginOptions, TTableElement } from '../types';
import { getEmptyTableNode } from '../utils/getEmptyTableNode';

export const insertTable = <V extends Value>(
  editor: PlateEditor<V>,
  { header }: TablePluginOptions
) => {
  if (
    !someNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    insertNodes<TTableElement>(editor, getEmptyTableNode(editor, { header }));
    if (editor.selection) {
      const tableEntry = getAboveNode(editor, {
        match: { type: getPluginType(editor, ELEMENT_TABLE) },
      });
      if (!tableEntry) {
        return;
      }
      const point = getStartPoint(editor, tableEntry[1]);
      selectEditor(editor, { at: point });
    }
  }
};
