import {
  type NodeEntry,
  type TElement,
  BaseParagraphPlugin,
  PathApi,
  deleteMerge,
} from '@udecode/plate';
import {
  type ExtendEditorTransforms,
  getEditorPlugin,
} from '@udecode/plate/react';
import { BaseResetNodePlugin } from '@udecode/plate-reset-node';
import {
  SIMULATE_BACKSPACE,
  onKeyDownResetNode,
} from '@udecode/plate-reset-node/react';

import type { ListConfig } from '../lib/BaseListPlugin';

import {
  BaseListItemContentPlugin,
  BaseListItemPlugin,
} from '../lib/BaseListPlugin';
import { isAcrossListItems, isListNested } from '../lib/queries';
import { getListItemEntry } from '../lib/queries/getListItemEntry';
import { unwrapList } from '../lib/transforms';
import { removeFirstListItem } from '../lib/transforms/removeFirstListItem';
import { removeListItem } from '../lib/transforms/removeListItem';

export const withDeleteBackwardList: ExtendEditorTransforms<ListConfig> = ({
  editor,
  tf: { deleteBackward },
}) => ({
  deleteBackward(unit) {
    const deleteBackwardList = () => {
      const res = getListItemEntry(editor, {});
      let moved: boolean | undefined = false;

      if (res) {
        const { list, listItem } = res;

        if (
          editor.api.isAt({
            match: (node) => node.type === editor.getType(BaseListItemPlugin),
            start: true,
          })
        ) {
          editor.tf.withoutNormalizing(() => {
            moved = removeFirstListItem(editor, { list, listItem });

            if (moved) return true;

            moved = removeListItem(editor, { list, listItem });

            if (moved) return true;
            if (
              !PathApi.hasPrevious(listItem[1]) &&
              !isListNested(editor, list[1])
            ) {
              onKeyDownResetNode({
                ...getEditorPlugin(
                  editor,
                  BaseResetNodePlugin.configure({
                    options: {
                      rules: [
                        {
                          defaultType: editor.getType(BaseParagraphPlugin),
                          hotkey: 'backspace',
                          predicate: () => editor.api.isAt({ start: true }),
                          types: [editor.getType(BaseListItemPlugin)],
                          onReset: (e) => unwrapList(e),
                        },
                      ],
                    },
                  })
                ),
                event: SIMULATE_BACKSPACE,
              } as any);
              moved = true;

              return;
            }

            const pointBeforeListItem = editor.api.before(
              editor.selection!.focus
            );

            let currentLic: NodeEntry<TElement> | undefined;
            let hasMultipleChildren = false;

            if (
              pointBeforeListItem &&
              isAcrossListItems(editor, {
                anchor: editor.selection!.anchor,
                focus: pointBeforeListItem,
              })
            ) {
              const licType = editor.getType(BaseListItemContentPlugin);
              const _licNodes = editor.api.nodes<TElement>({
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

            const leftoverListItem = editor.api.node<TElement>(
              PathApi.parent(currentLic[1])
            )!;

            if (leftoverListItem && leftoverListItem[0].children.length === 0) {
              editor.tf.removeNodes({ at: leftoverListItem[1] });
            }
          });
        }
      }

      return moved;
    };

    if (deleteBackwardList()) return;

    deleteBackward(unit);
  },
});
