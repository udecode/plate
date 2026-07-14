import type { ExtendPlateEditorExtension } from '@platejs/core';

import type { TableConfig } from './BaseTablePlugin';

import { getTableAbove, getTableGridAbove } from './queries';

export const withInsertTextTable: ExtendPlateEditorExtension<TableConfig> = ({
  editor,
}) => ({
  transforms: {
    insertText({ next, options, text, tx }) {
      if (editor.read.selection.isExpanded()) {
        const selection = editor.read.selection();
        const entry = selection
          ? getTableAbove(editor, { at: selection.anchor })
          : undefined;

        if (entry) {
          const cellEntries = getTableGridAbove(editor, { format: 'cell' });

          if (cellEntries.length > 1) {
            tx.selection.collapse({ edge: 'focus' });
          }
        }
      }

      return next({ options, text });
    },
  },
});
