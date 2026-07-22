import type { BaseEditor, PlateEditorExtension } from '@platejs/core';
import {
  type Element,
  editorCommands,
  NodeApi,
  PathApi,
  TextApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { isListNested } from './queries';
import { getListItemEntry } from './queries/getListItemEntry';
import { removeFirstListItem } from './transforms/removeFirstListItem';
import { removeListItem } from './transforms/removeListItem';
import { unwrapList } from './transforms/unwrapList';

export const withDeleteBackwardList = ({
  editor,
}: {
  editor: BaseEditor;
}): PlateEditorExtension => ({
  priority: 100,
  commands: ({ around }) => [
    around(editorCommands.delete, ({ input, state, next }) => {
      if (input.direction !== 'backward') return next();

      let handled = false;
      const prefix = state.transaction((tx) => {
        const selection = tx.selection();

        if (!selection) return;

        const res = getListItemEntry(editor, { at: selection }, tx);

        if (
          !res ||
          !tx.selection.isAtBlockStart({
            match: { type: editor.getType(KEYS.li) },
          })
        ) {
          return;
        }

        const { list, listItem } = res;

        if (
          !PathApi.hasPrevious(listItem[1]) &&
          isListNested(editor, list[1], tx)
        ) {
          const parentListItem = tx.nodes.parent<Element>(list[1]);
          const currentContent = tx.nodes.get<Element>([...listItem[1], 0]);
          const parentContent = parentListItem
            ? tx.nodes.get<Element>([...parentListItem[1], 0])
            : undefined;

          if (parentListItem && currentContent && parentContent) {
            const children = structuredClone(parentContent[0].children);

            for (const child of currentContent[0].children) {
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
              newSelection: { kind: 'text', anchor: point, focus: point },
            });
            tx.nodes.remove({ at: list[1] });
            handled = true;
            return;
          }
        }

        if (removeFirstListItem(editor, tx, { list, listItem })) {
          handled = true;
          return;
        }
        if (removeListItem(editor, tx, { list, listItem })) {
          handled = true;
          return;
        }

        if (
          !PathApi.hasPrevious(listItem[1]) &&
          !isListNested(editor, list[1], tx)
        ) {
          unwrapList(editor, tx, { at: listItem[1] });
          handled = true;
          return;
        }

        if (PathApi.hasPrevious(listItem[1])) {
          const previousListItem = tx.nodes.get<Element>(
            PathApi.previous(listItem[1])
          );
          const previousContent = previousListItem
            ? tx.nodes.get<Element>([...previousListItem[1], 0])
            : undefined;
          const currentContent = tx.nodes.get<Element>([...listItem[1], 0]);

          if (previousContent && currentContent) {
            const children = structuredClone(previousContent[0].children);
            const [lastText, lastPath] = NodeApi.last(previousContent[0], []);
            const point = {
              offset: NodeApi.string(lastText).length,
              path: [...previousContent[1], ...lastPath],
            };

            for (const child of currentContent[0].children) {
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

            tx.nodes.replaceChildren(children, {
              at: previousContent[1],
              newSelection: { kind: 'text', anchor: point, focus: point },
            });
            tx.nodes.remove({ at: listItem[1] });
            handled = true;
          }
        }
      });

      if (handled) return prefix;

      return next.after(prefix);
    }),
  ],
});
