import type { BaseEditor, PlateEditorExtension } from '@platejs/core';
import {
  type Element,
  type NodeEntry,
  ElementApi,
  editorCommands,
  PathApi,
  TextApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ListTransaction } from './BaseListPlugin';

import { getListItemEntry, getListRoot, hasListChild } from './queries/index';
import {
  moveListItemsToList,
  moveListItemUp,
  removeFirstListItem,
  removeListItem,
} from './transforms/index';

const selectionIsNotInAListHandler = (
  editor: BaseEditor,
  tx: ListTransaction
): boolean => {
  const selection = tx.selection();

  if (!selection) return false;

  const pointAfterSelection = tx.points.after(selection.focus);

  if (pointAfterSelection) {
    // there is a block after it
    const nextSiblingListRes = getListItemEntry(
      editor,
      { at: pointAfterSelection },
      tx
    );

    if (nextSiblingListRes) {
      // the next block is a list
      const { listItem } = nextSiblingListRes;
      const parentBlockEntity = tx.nodes.block({
        at: selection.anchor,
      });

      if (parentBlockEntity && !tx.text.string(parentBlockEntity[1])) {
        // the selected block is empty
        tx.nodes.remove();

        return true;
      }
      if (hasListChild(editor, listItem[0])) {
        // the next block has children, so we have to move the first item up
        const sublistRes = getListItemEntry(
          editor,
          { at: [...listItem[1], 1, 0, 0] },
          tx
        );

        if (sublistRes) moveListItemUp(editor, tx, sublistRes);
      }
    }
  }

  return false;
};

const selectionIsInAListHandler = (
  editor: BaseEditor,
  tx: ListTransaction,
  res: { list: NodeEntry<Element>; listItem: NodeEntry<Element> }
): boolean => {
  const { list, listItem } = res;

  const mergeContent = (from: Element, to: NodeEntry<Element>) => {
    const children = structuredClone(to[0].children);

    for (const child of from.children) {
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

    tx.nodes.replaceChildren(children, { at: to[1] });
  };

  const currentContent = tx.nodes.get<Element>([...listItem[1], 0]);
  const currentSublist = tx.nodes.get<Element>([...listItem[1], 1]);

  if (currentContent && currentSublist) {
    const firstChild = tx.nodes.get<Element>([...currentSublist[1], 0]);
    const firstChildContent = firstChild
      ? tx.nodes.get<Element>([...firstChild[1], 0])
      : undefined;

    if (firstChild && firstChildContent) {
      mergeContent(firstChildContent[0], currentContent);

      const childSublist = tx.nodes.get<Element>([...firstChild[1], 1]);
      const replacements = [
        ...(childSublist?.[0].children ?? []).flatMap((child) =>
          ElementApi.isElement(child) ? [child] : []
        ),
        ...currentSublist[0].children
          .slice(1)
          .flatMap((child) => (ElementApi.isElement(child) ? [child] : [])),
      ];

      if (replacements.length > 0) {
        tx.nodes.replaceChildren(replacements, { at: currentSublist[1] });
      } else {
        tx.nodes.remove({ at: currentSublist[1] });
      }

      return true;
    }
  }

  if (currentContent) {
    const pointAfterListItem = tx.points.after(listItem[1]);
    const nextItem = pointAfterListItem
      ? getListItemEntry(editor, { at: pointAfterListItem }, tx)
      : undefined;
    const nextContent = nextItem
      ? tx.nodes.get<Element>([...nextItem.listItem[1], 0])
      : undefined;
    const nextSublist = nextItem
      ? tx.nodes.get<Element>([...nextItem.listItem[1], 1])
      : undefined;

    if (
      nextItem &&
      nextContent &&
      PathApi.equals(list[1], nextItem.list[1]) &&
      !nextSublist
    ) {
      mergeContent(nextContent[0], currentContent);
      tx.nodes.remove({ at: nextItem.listItem[1] });

      return true;
    }

    if (nextItem && nextContent && !PathApi.equals(list[1], nextItem.list[1])) {
      mergeContent(nextContent[0], currentContent);

      if (nextSublist) {
        const children = nextSublist[0].children.flatMap((child) =>
          ElementApi.isElement(child) ? [child] : []
        );

        tx.nodes.insert(children, {
          at: [...list[1], listItem[1].at(-1)! + 1],
        });
      }

      tx.nodes.remove({ at: nextItem.listItem[1] });

      return true;
    }
  }

  // if it has no children
  if (!hasListChild(editor, listItem[0])) {
    const liType = editor.getType(KEYS.li);
    const _nodes = tx.nodes.entries({
      at: listItem[1],
      mode: 'lowest',
      match: (node, path) => {
        if (path.length === 0) {
          return false;
        }

        const isNodeLi = ElementApi.isElement(node) && node.type === liType;
        const isSiblingOfNodeLi =
          tx.nodes.get<Element>(PathApi.next(path))?.[0].type === liType;

        return isNodeLi && isSiblingOfNodeLi;
      },
    });
    const liWithSiblings = Array.from(_nodes, (entry) => entry[1])[0];

    if (!liWithSiblings) {
      // there are no more list item in the list
      const pointAfterListItem = tx.points.after(listItem[1]);

      if (pointAfterListItem) {
        // there is a block after it
        const nextSiblingListRes = getListItemEntry(
          editor,
          { at: pointAfterListItem },
          tx
        );

        if (nextSiblingListRes) {
          // it is a list so we merge the lists
          const listRoot = getListRoot(editor, listItem[1], tx);

          if (!listRoot) return false;

          moveListItemsToList(editor, tx, {
            deleteFromList: true,
            fromList: nextSiblingListRes.list,
            toList: listRoot,
          });

          return true;
        }
      }

      return false;
    }

    const siblingListItem = tx.nodes.get<Element>(PathApi.next(liWithSiblings));

    if (!siblingListItem) return false;

    const siblingList = tx.nodes.parent<Element>(siblingListItem[1]);

    if (
      siblingList &&
      removeListItem(editor, tx, {
        list: siblingList,
        listItem: siblingListItem,
        reverse: false,
      })
    ) {
      return true;
    }

    return false;
  }

  // if it has children
  const nestedList = tx.nodes.get<Element>(PathApi.next([...listItem[1], 0]));

  if (!nestedList) return false;

  const nestedListItem = tx.nodes.get<Element>([...nestedList[1], 0]);

  if (!nestedListItem) return false;

  if (
    removeFirstListItem(editor, tx, {
      list: nestedList,
      listItem: nestedListItem,
    })
  ) {
    return true;
  }
  if (
    removeListItem(editor, tx, {
      list: nestedList,
      listItem: nestedListItem,
    })
  ) {
    return true;
  }

  return false;
};

export const withDeleteForwardList = ({
  editor,
}: {
  editor: BaseEditor;
}): PlateEditorExtension => ({
  priority: 100,
  commands: ({ around }) => [
    around(editorCommands.delete, ({ input, state, next }) => {
      if (input.direction !== 'forward' || !state.selection.isAtBlockEnd()) {
        return next();
      }

      let handled = false;
      const prefix = state.transaction((tx) => {
        const selection = tx.selection();

        if (!selection) return;

        const res = getListItemEntry(editor, { at: selection }, tx);

        if (!res) {
          handled = selectionIsNotInAListHandler(editor, tx);
          return;
        }

        handled = selectionIsInAListHandler(editor, tx, res);
      });

      if (handled) return prefix;

      return next.after(prefix);
    }),
  ],
});
