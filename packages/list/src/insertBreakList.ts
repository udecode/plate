import {
  ParagraphPlugin,
  type SlateEditor,
  createTSlatePlugin,
  getPluginContext,
  isBlockAboveEmpty,
} from '@udecode/plate-common';
import {
  type ResetNodeConfig,
  SIMULATE_BACKSPACE,
  onKeyDownResetNode,
} from '@udecode/plate-reset-node';

import { ListItemPlugin } from './ListPlugin';
import { getListItemEntry } from './queries/getListItemEntry';
import { insertListItem } from './transforms/insertListItem';
import { moveListItemUp } from './transforms/moveListItemUp';
import { unwrapList } from './transforms/unwrapList';

export const insertBreakList = (editor: SlateEditor) => {
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
    ...getPluginContext(
      editor,
      createTSlatePlugin<ResetNodeConfig>({
        options: {
          rules: [
            {
              defaultType: editor.getType(ParagraphPlugin),
              onReset: (_editor) => unwrapList(_editor),
              predicate: () => !moved && isBlockAboveEmpty(editor),
              types: [editor.getType(ListItemPlugin)],
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
