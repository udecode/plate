import { type OverrideEditor, KEYS } from 'platejs';

import type { ListConfig } from './BaseListPlugin';

import { getListItemEntry } from './queries/getListItemEntry';
import { insertListItem } from './transforms/insertListItem';
import { moveListItemUp } from './transforms/moveListItemUp';

export const withInsertBreakList: OverrideEditor<ListConfig> = ({
  editor,
  getOptions,
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
          const inserted = insertListItem(editor, getOptions());

          if (inserted) return true;
        }
      };

      if (insertBreakList()) return;

      insertBreak();
    },
  },
});
