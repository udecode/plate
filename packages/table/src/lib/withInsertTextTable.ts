import type { OverrideEditor } from '@udecode/plate';

import { type TableConfig, getTableAbove } from '.';
import { getTableGridAbove } from './queries';

export const withInsertTextTable: OverrideEditor<TableConfig> = ({
  editor,
  tf: { insertText },
}) => ({
  transforms: {
    insertText(text, options) {
      if (editor.api.isExpanded()) {
        const entry = getTableAbove(editor, {
          at: editor.selection?.anchor,
        });

        if (entry) {
          const cellEntries = getTableGridAbove(editor, {
            format: 'cell',
          });

          if (cellEntries.length > 1) {
            editor.tf.collapse({
              edge: 'focus',
            });
          }
        }
      }

      insertText(text, options);
    },
  },
});
