import {
  ParagraphPlugin,
  type TElement,
  type TNodeEntry,
  deleteMerge,
  getNodeEntries,
  getNodeEntry,
  getPointBefore,
  isFirstChild,
  isSelectionAtBlockStart,
  removeNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import {
  type ExtendEditor,
  getEditorPlugin,
} from '@udecode/plate-common/react';
import { ResetNodePlugin } from '@udecode/plate-reset-node';
import {
  SIMULATE_BACKSPACE,
  onKeyDownResetNode,
} from '@udecode/plate-reset-node/react';
import { Path } from 'slate';

import type { ListConfig } from '../lib/ListPlugin';

import { ListItemContentPlugin, ListItemPlugin } from '../lib/ListPlugin';
import { isAcrossListItems, isListNested } from '../lib/queries';
import { getListItemEntry } from '../lib/queries/getListItemEntry';
import { unwrapList } from '../lib/transforms';
import { removeFirstListItem } from '../lib/transforms/removeFirstListItem';
import { removeListItem } from '../lib/transforms/removeListItem';

export const withDeleteBackwardList: ExtendEditor<ListConfig> = ({
  editor,
}) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (unit) => {
    const deleteBackwardList = () => {
      const res = getListItemEntry(editor, {});

      let moved: boolean | undefined = false;

      if (res) {
        const { list, listItem } = res;

        if (
          isSelectionAtBlockStart(editor, {
            match: (node) => node.type === editor.getType(ListItemPlugin),
          })
        ) {
          withoutNormalizing(editor, () => {
            moved = removeFirstListItem(editor, { list, listItem });

            if (moved) return true;

            moved = removeListItem(editor, { list, listItem });

            if (moved) return true;
            if (isFirstChild(listItem[1]) && !isListNested(editor, list[1])) {
              onKeyDownResetNode({
                ...getEditorPlugin(
                  editor,
                  ResetNodePlugin.configure({
                    options: {
                      rules: [
                        {
                          defaultType: editor.getType(ParagraphPlugin),
                          hotkey: 'backspace',
                          onReset: (e) => unwrapList(e),
                          predicate: () => isSelectionAtBlockStart(editor),
                          types: [editor.getType(ListItemPlugin)],
                        },
                      ],
                    },
                  })
                ),
                event: SIMULATE_BACKSPACE,
              });
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
              const licType = editor.getType(ListItemContentPlugin);
              const _licNodes = getNodeEntries<TElement>(editor, {
                at: listItem[1],
                match: (node) => node.type === licType,
                mode: 'lowest',
              });
              currentLic = [..._licNodes][0];
              hasMultipleChildren = currentLic[0].children.length > 1;
            }

            deleteMerge(editor, {
              reverse: true,
              unit,
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

    if (deleteBackwardList()) return;

    deleteBackward(unit);
  };

  return editor;
};
