import {
  deleteFragment,
  ELEMENT_DEFAULT,
  isCollapsed,
  isSelectionAtBlockStart,
} from '@udecode/slate-plugins-common';
import { getSlatePluginType, SPEditor } from '@udecode/slate-plugins-core';
import { getResetNodeOnKeyDown } from '@udecode/slate-plugins-reset-node';
import { Editor } from 'slate';
import { getListItemEntry } from './queries/getListItemEntry';
import { hasListChild } from './queries/hasListChild';
import { removeFirstListItem } from './transforms/removeFirstListItem';
import { removeListItem } from './transforms/removeListItem';
import { unwrapList } from './transforms/unwrapList';
import { ELEMENT_LI } from './defaults';

export const getListDeleteBackward = (
  editor: SPEditor,
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

  return getResetNodeOnKeyDown({
    rules: [
      {
        types: [getSlatePluginType(editor, ELEMENT_LI)],
        defaultType: getSlatePluginType(editor, ELEMENT_DEFAULT),
        predicate: () => isSelectionAtBlockStart(editor),
        onReset: (_editor) => unwrapList(_editor),
      },
    ],
  })(editor)(null);
};
