import { BaseResetNodePlugin, KEYS } from '@udecode/plate';
import {
  type OverrideEditor,
  getEditorPlugin,
  onKeyDownResetNode,
  SIMULATE_BACKSPACE,
} from '@udecode/plate/react';

import type { ListConfig } from '../lib/BaseListPlugin';

import { getListItemEntry } from '../lib/queries/getListItemEntry';
import { insertListItem } from '../lib/transforms/insertListItem';
import { moveListItemUp } from '../lib/transforms/moveListItemUp';
import { unwrapList } from '../lib/transforms/unwrapList';

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

        const didReset = onKeyDownResetNode({
          ...getEditorPlugin(
            editor,
            BaseResetNodePlugin.configure({
              options: {
                rules: [
                  {
                    defaultType: editor.getType(KEYS.p),
                    types: [editor.getType(KEYS.li)],
                    predicate: () =>
                      !moved &&
                      editor.api.isEmpty(editor.selection, { block: true }),
                    onReset: (editor) => unwrapList(editor),
                  },
                ],
              },
            })
          ),
          event: SIMULATE_BACKSPACE,
        } as any);

        if (didReset) return true;
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
