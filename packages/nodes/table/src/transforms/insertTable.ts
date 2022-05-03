import {
  getAboveNode,
  getPluginType,
  insertNodes,
  PlateEditor,
  selectEditor,
  someNode,
  TElement,
  Value,
} from '@udecode/plate-core';
import { Editor } from 'slate';
import { ELEMENT_TABLE } from '../createTablePlugin';
import { TablePluginOptions } from '../types';
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
    insertNodes<TElement>(editor, getEmptyTableNode(editor, { header }));
    if (editor.selection) {
      const tableEntry = getAboveNode(editor, {
        match: { type: getPluginType(editor, ELEMENT_TABLE) },
      });
      if (!tableEntry) {
        return;
      }
      const point = Editor.start(editor, tableEntry[1]);
      selectEditor(editor, { at: point });
    }
  }
};
