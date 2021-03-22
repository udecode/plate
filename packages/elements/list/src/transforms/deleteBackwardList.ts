import {
  deleteFragment,
  ELEMENT_DEFAULT,
  isCollapsed,
  isSelectionAtBlockStart,
} from '@udecode/slate-plugins-common';
import { getPluginType } from '@udecode/slate-plugins-core';
import { onKeyDownResetNode } from '@udecode/slate-plugins-reset-node';
import { Editor } from 'slate';
import { ELEMENT_LI } from '../defaults';
import { getListItemEntry } from '../queries/getListItemEntry';
import { hasListChild } from '../queries/hasListChild';
import { removeFirstListItem } from './removeFirstListItem';
import { removeListItem } from './removeListItem';
import { unwrapList } from './unwrapList';

export const deleteBackwardList = (
  editor: Editor,
  unit: 'character' | 'word' | 'line' | 'block'
) => {
  const res = getListItemEntry(editor, {});

  if (res) {
    const { list, listItem } = res;
    const [listItemNode] = listItem;

    if (isSelectionAtBlockStart(editor)) {
      let moved: boolean | undefined;

      Editor.withoutNormalizing(editor, () => {
        moved = removeFirstListItem(editor, { list, listItem });
        if (moved) return;

        moved = removeListItem(editor, { list, listItem });

        if (!moved) {
          deleteFragment(editor, {
            unit,
            reverse: true,
          });
        }

        moved = true;

        // moved = moveListItemUp(editor, { list, listItem });
      });

      if (moved) return true;
    }

    if (hasListChild(editor, listItemNode) && isCollapsed(editor.selection)) {
      return;
    }
  }

  const resetBlockTypesListRule = {
    types: [getPluginType(editor, ELEMENT_LI)],
    defaultType: getPluginType(editor, ELEMENT_DEFAULT),
    onReset: (_editor: Editor) => unwrapList(_editor),
  };

  return onKeyDownResetNode({
    rules: [
      {
        ...resetBlockTypesListRule,
        predicate: () => isSelectionAtBlockStart(editor),
      },
    ],
  })(editor)(null);
};
