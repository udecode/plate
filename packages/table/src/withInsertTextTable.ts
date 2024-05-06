import {
  type PlateEditor,
  type Value,
  type WithPlatePlugin,
  collapseSelection,
  isExpanded,
} from '@udecode/plate-common/server';

import type { TablePlugin } from './types';

import { getTableAbove, getTableGridAbove } from './queries/index';

export const withInsertTextTable = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  _plugin: WithPlatePlugin<TablePlugin<V>, V, E>
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
