import type { ExtendPlateEditorExtension } from '@platejs/core';
import {
  type Descendant,
  type Element,
  NodeApi,
  PathApi,
  TextApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ListConfig } from './BaseListPlugin';

import { isAcrossListItems, isListNested } from './queries';
import { getListItemEntry } from './queries/getListItemEntry';
import { removeFirstListItem } from './transforms/removeFirstListItem';
import { removeListItem } from './transforms/removeListItem';
import { unwrapList } from './transforms/unwrapList';

export const withDeleteBackwardList: ExtendPlateEditorExtension<ListConfig> = ({
  editor,
}) => ({
  priority: 100,
  transforms: {
    deleteBackward({ next, tx, unit }) {
      const selection = editor.read.selection();

      if (!selection) return next({ unit });

      const res = getListItemEntry(editor, {});

      if (
        !res ||
        !editor.read.selection.isAtBlockStart({
          match: { type: editor.getType(KEYS.li) },
        })
      ) {
        return next({ unit });
      }

      const { list, listItem } = res;

      if (!PathApi.hasPrevious(listItem[1]) && isListNested(editor, list[1])) {
        const parentListItem = editor.read.nodes.parent<Element>(list[1]);
        const currentContent = editor.read.nodes.get<Element>([
          ...listItem[1],
          0,
        ]);
        const parentContent = parentListItem
          ? editor.read.nodes.get<Element>([...parentListItem[1], 0])
          : undefined;

        if (parentListItem && currentContent && parentContent) {
          const children: Descendant[] = structuredClone(
            parentContent[0].children
          ) as Descendant[];

          for (const child of currentContent[0].children as Descendant[]) {
            const previous = children.at(-1);

            if (
              previous &&
              TextApi.isText(previous) &&
              TextApi.isText(child) &&
              TextApi.equals(previous, child, { loose: true })
            ) {
              previous.text += child.text;
            } else {
              children.push(structuredClone(child));
            }
          }

          const [lastText, lastPath] = NodeApi.last(
            { ...parentContent[0], children },
            []
          );
          const point = {
            offset: NodeApi.string(lastText).length,
            path: [...parentContent[1], ...lastPath],
          };

          tx.nodes.replaceChildren(children, {
            at: parentContent[1],
            newSelection: { anchor: point, focus: point },
          });
          tx.nodes.remove({ at: list[1] });

          return true;
        }
      }

      if (removeFirstListItem(editor, tx, { list, listItem })) return true;
      if (removeListItem(editor, tx, { list, listItem })) return true;

      if (!PathApi.hasPrevious(listItem[1]) && !isListNested(editor, list[1])) {
        unwrapList(editor, tx, { at: listItem[1] });
        return true;
      }

      const pointBeforeListItem = editor.read.points.before(selection.focus);
      const currentLic =
        pointBeforeListItem &&
        isAcrossListItems(editor, {
          anchor: selection.anchor,
          focus: pointBeforeListItem,
        })
          ? editor.read.nodes.toArray<Element>({
              at: listItem[1],
              match: { type: editor.getType(KEYS.lic) },
              mode: 'lowest',
            })[0]
          : undefined;

      const hasMultipleChildren = (currentLic?.[0].children.length ?? 0) > 1;

      next({ unit });

      if (currentLic && hasMultipleChildren) {
        const leftoverListItem = editor.read.nodes.get<Element>(
          PathApi.parent(currentLic[1])
        );

        if (leftoverListItem?.[0].children.length === 0) {
          tx.nodes.remove({ at: leftoverListItem[1] });
        }
      }

      return true;
    },
  },
});
