import type { ResetNodeConfig } from '@udecode/plate-reset-node';

import {
  BaseParagraphPlugin,
  createTSlatePlugin,
  isBlockAboveEmpty,
} from '@udecode/plate-common';
import {
  type ExtendEditor,
  getEditorPlugin,
} from '@udecode/plate-common/react';
import {
  SIMULATE_BACKSPACE,
  onKeyDownResetNode,
} from '@udecode/plate-reset-node/react';

import { BaseListItemPlugin, type ListConfig } from '../lib/BaseListPlugin';
import { getListItemEntry } from '../lib/queries/getListItemEntry';
import { insertListItem } from '../lib/transforms/insertListItem';
import { moveListItemUp } from '../lib/transforms/moveListItemUp';
import { unwrapList } from '../lib/transforms/unwrapList';

export const withInsertBreakList: ExtendEditor<ListConfig> = ({ editor }) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    const insertBreakList = () => {
      if (!editor.selection) return;

      const res = getListItemEntry(editor, {});
      let moved: boolean | undefined;

      // If selection is in a li
      if (res) {
        const { list, listItem } = res;

        // If selected li is empty, move it up.
        if (isBlockAboveEmpty(editor)) {
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
                  onReset: (_editor) => unwrapList(_editor),
                  predicate: () => !moved && isBlockAboveEmpty(editor),
                  types: [editor.getType(BaseListItemPlugin)],
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

    // TODO react
    if (insertBreakList()) return;

    insertBreak();
  };

  return editor;
};
