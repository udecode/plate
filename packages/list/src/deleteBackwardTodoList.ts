import {
  deleteMerge,
  ELEMENT_DEFAULT,
  getPluginType,
  isFirstChild,
  isSelectionAtBlockStart,
  mockPlugin,
  PlateEditor,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import {
  onKeyDownResetNode,
  ResetNodePlugin,
  SIMULATE_BACKSPACE,
} from '@udecode/plate-reset-node';

import { getTodoListItemEntry } from './queries';
import { ELEMENT_TODO_LI } from './todo-list';
import { isTodoListNested } from './todo-list/isTodoListNested';
import { unwrapList } from './transforms/unwrapList';

export const deleteBackwardTodoList = <V extends Value>(
  editor: PlateEditor<V>,
  unit: 'character' | 'word' | 'line' | 'block'
) => {
  const res = getTodoListItemEntry(editor, {});

  let moved: boolean | undefined = false;

  if (res) {
    const { list, listItem } = res;
    if (
      isSelectionAtBlockStart(editor, {
        match: (node) => node.type === getPluginType(editor, ELEMENT_TODO_LI),
      })
    ) {
      withoutNormalizing(editor, () => {
        if (isFirstChild(listItem[1]) && !isTodoListNested(editor, list[1])) {
          onKeyDownResetNode(
            editor as any,
            mockPlugin<ResetNodePlugin>({
              options: {
                rules: [
                  {
                    types: [getPluginType(editor, ELEMENT_TODO_LI)],
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
