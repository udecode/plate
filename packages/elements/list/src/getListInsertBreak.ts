import { ELEMENT_DEFAULT, isBlockAboveEmpty } from '@udecode/plate-common';
import { getPluginType, PlateEditor } from '@udecode/plate-core';
import {
  getResetNodeOnKeyDown,
  SIMULATE_BACKSPACE,
} from '@udecode/plate-reset-node';
import { getListItemEntry } from './queries/getListItemEntry';
import { insertListItem } from './transforms/insertListItem';
import { moveListItemUp } from './transforms/moveListItemUp';
import { unwrapList } from './transforms/unwrapList';
import { ELEMENT_LI } from './createListPlugin';

export const getListInsertBreak = (editor: PlateEditor) => {
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

  const didReset = getResetNodeOnKeyDown()(editor, {
    key: '',
    type: '',
    inject: {},
    options: {
      rules: [
        {
          types: [getPluginType(editor, ELEMENT_LI)],
          defaultType: getPluginType(editor, ELEMENT_DEFAULT),
          predicate: () => !moved && isBlockAboveEmpty(editor),
          onReset: (_editor) => unwrapList(_editor as PlateEditor),
        },
      ],
    },
  })(SIMULATE_BACKSPACE as any);
  if (didReset) return true;

  /**
   * If selection is in li > p, insert li.
   */
  if (!moved) {
    const inserted = insertListItem(editor);
    if (inserted) return true;
  }
};
