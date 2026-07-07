import {
  type NodeEntry,
  type OverrideEditor,
  type TElement,
  deleteMerge,
  KEYS,
  PathApi,
} from 'platejs';

import type { ListConfig } from './BaseListPlugin';

import { isAcrossListItems, isListNested } from './queries';
import { getListItemEntry } from './queries/getListItemEntry';
import { removeFirstListItem } from './transforms/removeFirstListItem';
import { removeListItem } from './transforms/removeListItem';

export const withDeleteBackwardList: OverrideEditor<ListConfig> = ({
  editor,
  tf: { deleteBackward },
}) => ({
  transforms: {
    deleteBackward(unit) {
      const deleteBackwardList = () => {
        const res = getListItemEntry(editor, {});
        let moved: boolean | undefined = false;

        if (res) {
          const { list, listItem } = res;

          if (
            editor.api.isAt({
              start: true,
              match: (node) => node.type === editor.getType(KEYS.li),
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
                editor.tf.resetBlock({ at: listItem[1] });

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
                const licType = editor.getType(KEYS.lic);
                const _licNodes = editor.api.nodes<TElement>({
                  at: listItem[1],
                  mode: 'lowest',
                  match: (node) => node.type === licType,
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

              if (
                leftoverListItem &&
                leftoverListItem[0].children.length === 0
              ) {
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
  },
});
