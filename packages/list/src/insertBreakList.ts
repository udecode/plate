import {
  ELEMENT_DEFAULT,
  type PlateEditor,
  createPlugin,
  getPluginType,
  isBlockAboveEmpty,
} from '@udecode/plate-common/server';
import {
  type ResetNodePluginOptions,
  SIMULATE_BACKSPACE,
  onKeyDownResetNode,
} from '@udecode/plate-reset-node';

import { ELEMENT_LI } from './ListPlugin';
import { getListItemEntry } from './queries/getListItemEntry';
import { insertListItem } from './transforms/insertListItem';
import { moveListItemUp } from './transforms/moveListItemUp';
import { unwrapList } from './transforms/unwrapList';

export const insertBreakList = (editor: PlateEditor) => {
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
    editor,
    event: SIMULATE_BACKSPACE,
    plugin: createPlugin<string, ResetNodePluginOptions>({
      options: {
        rules: [
          {
            defaultType: getPluginType(editor, ELEMENT_DEFAULT),
            onReset: (_editor) => unwrapList(_editor),
            predicate: () => !moved && isBlockAboveEmpty(editor),
            types: [getPluginType(editor, ELEMENT_LI)],
          },
        ],
      },
    }),
  });

  if (didReset) return true;
  /** If selection is in li > p, insert li. */
  if (!moved) {
    const inserted = insertListItem(editor);

    if (inserted) return true;
  }
};
