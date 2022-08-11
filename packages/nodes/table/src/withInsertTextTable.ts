import {
  collapseSelection,
  getPluginType,
  isExpanded,
  isRangeInSameBlock,
  PlateEditor,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-core';
import { getTableGridAbove } from './queries/index';
import { ELEMENT_TABLE } from './createTablePlugin';
import { TablePlugin } from './types';

export const withInsertTextTable = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  { options }: WithPlatePlugin<TablePlugin<V>, V, E>
) => {
  const { insertText } = editor;

  editor.insertText = (text) => {
    // console.log('a', editor.selection);
    //
    // return;
    if (isExpanded(editor.selection)) {
      const tableEntry = isRangeInSameBlock(editor, {
        match: { type: getPluginType(editor, ELEMENT_TABLE) },
      });

      if (tableEntry) {
        const cellEntries = getTableGridAbove(editor, {
          format: 'cell',
        });

        if (cellEntries.length > 1) {
          collapseSelection(editor, {
            edge: 'focus',
          });
          console.log(editor.selection);
        }
      }
    }

    insertText(text);
  };

  return editor;
};
