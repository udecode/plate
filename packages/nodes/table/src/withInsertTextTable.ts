import {
  collapseSelection,
  isExpanded,
  PlateEditor,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common';
import { getTableAbove, getTableGridAbove } from './queries/index';
import { TablePlugin } from './types';

export const withInsertTextTable = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  plugin: WithPlatePlugin<TablePlugin<V>, V, E>
) => {
  const { insertText } = editor;

  editor.insertText = (text) => {
    if (isExpanded(editor.selection)) {
      const entry = getTableAbove(editor, {
        at: editor.selection?.anchor,
      });

      if (entry) {
        const cellEntries = getTableGridAbove(editor, {
          format: 'cell',
        });

        if (cellEntries.length > 1) {
          collapseSelection(editor, {
            edge: 'focus',
          });
        }
      }
    }

    insertText(text);
  };

  return editor;
};
