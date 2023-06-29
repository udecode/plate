import {
  ELEMENT_DEFAULT,
  PlateEditor,
  Value,
  deleteMerge,
  getPluginType,
  isFirstChild,
  isSelectionAtBlockStart,
  mockPlugin,
  withoutNormalizing,
} from '@udecode/plate-common';
import {
  ResetNodePlugin,
  SIMULATE_BACKSPACE,
  onKeyDownResetNode,
} from '@udecode/plate-reset-node';

import { ELEMENT_LI } from './createListPlugin';
import { getListItemEntry } from './queries/getListItemEntry';
import { isListNested } from './queries/isListNested';
import { removeFirstListItem } from './transforms/removeFirstListItem';
import { removeListItem } from './transforms/removeListItem';
import { unwrapList } from './transforms/unwrapList';

export const deleteBackwardList = <V extends Value>(
  editor: PlateEditor<V>,
  unit: 'character' | 'word' | 'line' | 'block'
) => {
  const res = getListItemEntry(editor, {});

  let moved: boolean | undefined = false;

  if (res) {
    const { list, listItem } = res;

    if (
      isSelectionAtBlockStart(editor, {
        match: (node) => node.type === getPluginType(editor, ELEMENT_LI),
      })
    ) {
      withoutNormalizing(editor, () => {
        moved = removeFirstListItem(editor, { list, listItem });
        if (moved) return true;

        moved = removeListItem(editor, { list, listItem });
        if (moved) return true;

        if (isFirstChild(listItem[1]) && !isListNested(editor, list[1])) {
          onKeyDownResetNode(
            editor as any,
            mockPlugin<ResetNodePlugin>({
              options: {
                rules: [
                  {
                    types: [getPluginType(editor, ELEMENT_LI)],
                    defaultType: getPluginType(editor, ELEMENT_DEFAULT),
                    hotkey: 'backspace',
                    predicate: () => isSelectionAtBlockStart(editor),
                    onReset: (e) => unwrapList(e),
                  },
                ],
              },
            })
          )(SIMULATE_BACKSPACE);
          moved = true;
          return;
        }

        deleteMerge(editor, {
          unit,
          reverse: true,
        });
        moved = true;
      });
    }
  }

  return moved;
};
