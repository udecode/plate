import type { ResetNodeConfig } from '@udecode/plate-reset-node';

import { BaseParagraphPlugin, createTSlatePlugin } from '@udecode/plate';
import {
  type ExtendEditorTransforms,
  getEditorPlugin,
} from '@udecode/plate/react';
import {
  SIMULATE_BACKSPACE,
  onKeyDownResetNode,
} from '@udecode/plate-reset-node/react';

import { type ListConfig, BaseListItemPlugin } from '../lib/BaseListPlugin';
import { getListItemEntry } from '../lib/queries/getListItemEntry';
import { insertListItem } from '../lib/transforms/insertListItem';
import { moveListItemUp } from '../lib/transforms/moveListItemUp';
import { unwrapList } from '../lib/transforms/unwrapList';

export const withInsertBreakList: ExtendEditorTransforms<ListConfig> = ({
  editor,
  tf: { insertBreak },
}) => ({
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
                  predicate: () =>
                    !moved &&
                    editor.api.isEmpty(editor.selection, { block: true }),
                  types: [editor.getType(BaseListItemPlugin)],
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
});
