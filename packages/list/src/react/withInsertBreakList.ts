import type { ResetNodeConfig } from '@udecode/plate-reset-node';

import { BaseParagraphPlugin, createTSlatePlugin } from '@udecode/plate';
import {
  onKeyDownResetNode,
  SIMULATE_BACKSPACE,
} from '@udecode/plate-reset-node/react';
import { type OverrideEditor, getEditorPlugin } from '@udecode/plate/react';

import { type ListConfig, BaseListItemPlugin } from '../lib/BaseListPlugin';
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
            createTSlatePlugin<ResetNodeConfig>({
              options: {
                rules: [
                  {
                    defaultType: editor.getType(BaseParagraphPlugin),
                    types: [editor.getType(BaseListItemPlugin)],
                    predicate: () =>
                      !moved &&
                      editor.api.isEmpty(editor.selection, { block: true }),
                    onReset: (_editor) => unwrapList(_editor),
                  },
                ],
              },
            })
          ),
          event: SIMULATE_BACKSPACE,
        });

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
