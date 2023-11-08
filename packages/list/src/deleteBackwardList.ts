import {
  deleteMerge,
  ELEMENT_DEFAULT,
  getNodeEntries,
  getNodeEntry,
  getPluginType,
  getPointBefore,
  isFirstChild,
  isSelectionAtBlockStart,
  mockPlugin,
  PlateEditor,
  removeNodes,
  TElement,
  TNodeEntry,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import {
  onKeyDownResetNode,
  ResetNodePlugin,
  SIMULATE_BACKSPACE,
} from '@udecode/plate-reset-node';
import { Path, TextUnit } from 'slate';

import { ELEMENT_LI, ELEMENT_LIC } from './createListPlugin';
import { isAcrossListItems } from './queries';
import { getListItemEntry } from './queries/getListItemEntry';
import { isListNested } from './queries/isListNested';
import { removeFirstListItem } from './transforms/removeFirstListItem';
import { removeListItem } from './transforms/removeListItem';
import { unwrapList } from './transforms/unwrapList';

export const deleteBackwardList = <V extends Value>(
  editor: PlateEditor<V>,
  unit: TextUnit
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

        const pointBeforeListItem = getPointBefore(
          editor,
          editor.selection!.focus
        );

        let currentLic: TNodeEntry<TElement> | undefined;
        let hasMultipleChildren = false;

        // check if closest lic ancestor has multiple children
        if (
          pointBeforeListItem &&
          isAcrossListItems({
            ...editor,
            selection: {
              anchor: editor.selection!.anchor,
              focus: pointBeforeListItem,
            },
          })
        ) {
          // get closest lic ancestor of current selectable
          const licType = getPluginType(editor, ELEMENT_LIC);
          const _licNodes = getNodeEntries<TElement>(editor, {
            at: listItem[1],
            mode: 'lowest',
            match: (node) => node.type === licType,
          });
          currentLic = [..._licNodes][0];
          hasMultipleChildren = currentLic[0].children.length > 1;
        }

        deleteMerge(editor, {
          unit,
          reverse: true,
        });
        moved = true;

        if (!currentLic || !hasMultipleChildren) return;

        const leftoverListItem = getNodeEntry<TElement>(
          editor,
          Path.parent(currentLic[1])
        )!;

        if (leftoverListItem && leftoverListItem[0].children.length === 0) {
          // remove the leftover empty list item
          removeNodes(editor, { at: leftoverListItem[1] });
        }
      });
    }
  }

  return moved;
};
