import {
  deleteFragment,
  ELEMENT_DEFAULT,
  isFirstChild,
  isSelectionAtBlockStart,
} from '@udecode/plate-common';
import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
import {
  getResetNodeOnKeyDown,
  SIMULATE_BACKSPACE,
} from '@udecode/plate-reset-node';
import { Editor } from 'slate';
import { getListItemEntry } from './queries/getListItemEntry';
import { isListNested } from './queries/isListNested';
import { removeFirstListItem } from './transforms/removeFirstListItem';
import { removeListItem } from './transforms/removeListItem';
import { unwrapList } from './transforms/unwrapList';
import { ELEMENT_LI } from './defaults';

export const getListDeleteBackward = (
  editor: SPEditor,
  unit: 'character' | 'word' | 'line' | 'block'
) => {
  const res = getListItemEntry(editor, {});

  let moved: boolean | undefined = false;

  if (res) {
    const { list, listItem } = res;

    if (
      isSelectionAtBlockStart(editor, {
        match: (node) => node.type === ELEMENT_LI,
      })
    ) {
      Editor.withoutNormalizing(editor, () => {
        moved = removeFirstListItem(editor, { list, listItem });
        if (moved) return true;

        moved = removeListItem(editor, { list, listItem });
        if (moved) return true;

        if (isFirstChild(listItem[1]) && !isListNested(editor, list[1])) {
          getResetNodeOnKeyDown({
            rules: [
              {
                types: [getPlatePluginType(editor, ELEMENT_LI)],
                defaultType: getPlatePluginType(editor, ELEMENT_DEFAULT),
                hotkey: 'backspace',
                predicate: () => isSelectionAtBlockStart(editor),
                onReset: (_editor) => unwrapList(_editor as SPEditor),
              },
            ],
          })(editor)(SIMULATE_BACKSPACE);
          moved = true;
          return;
        }

        deleteFragment(editor, {
          unit,
          reverse: true,
        });
        moved = true;
      });
    }
  }

  return moved;
};
