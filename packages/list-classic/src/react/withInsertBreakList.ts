import type { OverrideEditor } from '@udecode/plate/react';

import { KEYS } from '@udecode/plate';

import type { ListConfig } from '../lib/BaseListPlugin';

import { getListItemEntry } from '../lib/queries/getListItemEntry';
import { insertListItem } from '../lib/transforms/insertListItem';
import { moveListItemUp } from '../lib/transforms/moveListItemUp';

export const withInsertBreakList: OverrideEditor<ListConfig> = ({
  editor,
  tf: { insertBreak },
}) => ({
  transforms: {
    insertBreak() {
      const insertBreakList = () => {
        if (!editor.selection) return;

        const res = getListItemEntry(editor, {});
        let moved: boolean | undefined;

        // If selection is in a li
        if (res) {
          const { list, listItem } = res;

          // If selected li is empty, move it up.
          if (editor.api.isEmpty(editor.selection, { block: true })) {
            moved = moveListItemUp(editor, {
              list,
              listItem,
            });

            if (moved) return true;
          }
        }

        const block = editor.api.block({
          match: { type: editor.getType(KEYS.li) },
        });
        if (block && editor.api.isEmpty(editor.selection, { block: true })) {
          const didReset = editor.tf.resetBlock({ at: block[1] });

          if (didReset) return true;
        }

        /** If selection is in li > p, insert li. */
        if (!moved) {
          const inserted = insertListItem(editor);

          if (inserted) return true;
        }
      };

      if (insertBreakList()) return;

      insertBreak();
    },
  },
});
