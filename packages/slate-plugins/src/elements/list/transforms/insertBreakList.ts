import { isBlockAboveEmpty } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { onKeyDownResetBlockType } from '../../../handlers/reset-block-type/onKeyDownResetBlockType';
import { getListItemEntry } from '../queries/getListItemEntry';
import { insertListItem } from './insertListItem';
import { moveListItemUp } from './moveListItemUp';
import { unwrapList } from './unwrapList';

export const insertBreakList = (
  editor: Editor,
  options: SlatePluginsOptions
) => {
  const { p, li } = options;

  if (!editor.selection) return;

  const res = getListItemEntry(editor, {}, options);
  let moved: boolean | undefined;

  // If selection is in a li
  if (res) {
    const { list, listItem } = res;

    // If selected li is empty, move it up.
    if (isBlockAboveEmpty(editor)) {
      moved = moveListItemUp(
        editor,
        {
          list,
          listItem,
        },
        options
      );

      if (moved) return true;
    }
  }

  const resetBlockTypesListRule = {
    types: [li.type],
    defaultType: p.type,
    onReset: (_editor: Editor) => unwrapList(_editor, options),
  };

  const didReset = onKeyDownResetBlockType({
    rules: [
      {
        ...resetBlockTypesListRule,
        predicate: () => !moved && isBlockAboveEmpty(editor),
      },
    ],
  })(null, editor);
  if (didReset) return true;

  /**
   * If selection is in li > p, insert li.
   */
  if (!moved) {
    const inserted = insertListItem(editor, options);
    if (inserted) return true;
  }
};
