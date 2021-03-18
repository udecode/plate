import { isBlockAboveEmpty } from '@udecode/slate-plugins-common';
import { getPluginType } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { onKeyDownResetBlockType } from '../../../handlers/reset-block-type/onKeyDownResetBlockType';
import { ELEMENT_PARAGRAPH } from '../../paragraph/defaults';
import { ELEMENT_LI } from '../defaults';
import { getListItemEntry } from '../queries/getListItemEntry';
import { insertListItem } from './insertListItem';
import { moveListItemUp } from './moveListItemUp';
import { unwrapList } from './unwrapList';

export const insertBreakList = (editor: Editor) => {
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

  const resetBlockTypesListRule = {
    types: [getPluginType(editor, ELEMENT_LI)],
    defaultType: getPluginType(editor, ELEMENT_PARAGRAPH),
    onReset: (_editor: Editor) => unwrapList(_editor),
  };

  const didReset = onKeyDownResetBlockType({
    rules: [
      {
        ...resetBlockTypesListRule,
        predicate: () => !moved && isBlockAboveEmpty(editor),
      },
    ],
  })(editor)(null);
  if (didReset) return true;

  /**
   * If selection is in li > p, insert li.
   */
  if (!moved) {
    const inserted = insertListItem(editor);
    if (inserted) return true;
  }
};
