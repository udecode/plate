import {
  deleteFragment,
  isCollapsed,
  isSelectionAtBlockStart,
} from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { onKeyDownResetBlockType } from '../../../handlers/reset-block-type/onKeyDownResetBlockType';
import { getListItemEntry } from '../queries/getListItemEntry';
import { hasListChild } from '../queries/hasListChild';
import { removeFirstListItem } from './removeFirstListItem';
import { removeListItem } from './removeListItem';
import { unwrapList } from './unwrapList';

export const deleteBackwardList = (
  editor: Editor,
  unit: 'character' | 'word' | 'line' | 'block',
  options: SlatePluginsOptions
) => {
  const { p, li } = options;

  const res = getListItemEntry(editor, {}, options);

  if (res) {
    const { list, listItem } = res;
    const [listItemNode] = listItem;

    if (isSelectionAtBlockStart(editor)) {
      let moved: boolean | undefined;

      Editor.withoutNormalizing(editor, () => {
        moved = removeFirstListItem(editor, { list, listItem }, options);
        if (moved) return;

        moved = removeListItem(editor, { list, listItem }, options);

        if (!moved) {
          deleteFragment(editor, {
            unit,
            reverse: true,
          });
        }

        moved = true;

        // moved = moveListItemUp(editor, { list, listItem }, options);
      });

      if (moved) return true;
    }

    if (hasListChild(listItemNode, options) && isCollapsed(editor.selection)) {
      return;
    }
  }

  const resetBlockTypesListRule = {
    types: [li.type],
    defaultType: p.type,
    onReset: (_editor: Editor) => unwrapList(_editor, options),
  };

  return onKeyDownResetBlockType({
    rules: [
      {
        ...resetBlockTypesListRule,
        predicate: () => isSelectionAtBlockStart(editor),
      },
    ],
  })(null, editor);
};
