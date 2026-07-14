import type { BaseEditor } from '@platejs/core';
import type { ExtendPlateEditorExtension } from '@platejs/core';
import {
  type Descendant,
  type Element,
  type NodeEntry,
  type TextUnit,
  PathApi,
  TextApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ListConfig, ListTransaction } from './BaseListPlugin';

import {
  getListItemEntry,
  getListRoot,
  hasListChild,
  isAcrossListItems,
} from './queries/index';
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
  const selection = editor.read.selection();

  if (!selection) return false;

  const pointAfterSelection = editor.read.points.after(selection.focus);

  if (pointAfterSelection) {
    // there is a block after it
    const nextSiblingListRes = getListItemEntry(editor, {
      at: pointAfterSelection,
    });

    if (nextSiblingListRes) {
      // the next block is a list
      const { listItem } = nextSiblingListRes;
      const parentBlockEntity = editor.read.nodes.block({
        at: selection.anchor,
      });

      if (parentBlockEntity && !editor.read.text.string(parentBlockEntity[1])) {
        // the selected block is empty
        tx.nodes.remove();

        return true;
      }
      if (hasListChild(editor, listItem[0])) {
        // the next block has children, so we have to move the first item up
        const sublistRes = getListItemEntry(editor, {
          at: [...listItem[1], 1, 0, 0],
        });

        if (sublistRes) moveListItemUp(editor, tx, sublistRes);
      }
    }
  }

  return false;
};

const selectionIsInAListHandler = (
  editor: BaseEditor,
  tx: ListTransaction,
  res: { list: NodeEntry<Element>; listItem: NodeEntry<Element> },
  defaultDelete: (unit?: TextUnit) => boolean,
  unit: 'block' | 'character' | 'line' | 'word' = 'character'
): boolean => {
  const { list, listItem } = res;

  const mergeContent = (from: Element, to: NodeEntry<Element>) => {
    const children = structuredClone(to[0].children) as Descendant[];

    for (const child of from.children as Descendant[]) {
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

  const currentContent = editor.read.nodes.get<Element>([...listItem[1], 0]);
  const currentSublist = editor.read.nodes.get<Element>([...listItem[1], 1]);

  if (currentContent && currentSublist) {
    const firstChild = editor.read.nodes.get<Element>([
      ...currentSublist[1],
      0,
    ]);
    const firstChildContent = firstChild
      ? editor.read.nodes.get<Element>([...firstChild[1], 0])
      : undefined;

    if (firstChild && firstChildContent) {
      mergeContent(firstChildContent[0], currentContent);

      const childSublist = editor.read.nodes.get<Element>([
        ...firstChild[1],
        1,
      ]);
      const replacements = [
        ...((childSublist?.[0].children ?? []) as Element[]),
        ...(currentSublist[0].children.slice(1) as Element[]),
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
    const pointAfterListItem = editor.read.points.after(listItem[1]);
    const nextItem = pointAfterListItem
      ? getListItemEntry(editor, { at: pointAfterListItem })
      : undefined;
    const nextContent = nextItem
      ? editor.read.nodes.get<Element>([...nextItem.listItem[1], 0])
      : undefined;
    const nextSublist = nextItem
      ? editor.read.nodes.get<Element>([...nextItem.listItem[1], 1])
      : undefined;

    if (
      nextItem &&
      nextContent &&
      nextSublist &&
      !PathApi.equals(list[1], nextItem.list[1])
    ) {
      mergeContent(nextContent[0], currentContent);
      tx.nodes.insert(nextSublist[0].children as Element[], {
        at: [...list[1], listItem[1].at(-1)! + 1],
      });
      tx.nodes.remove({ at: nextItem.listItem[1] });

      return true;
    }
  }

  // if it has no children
  if (!hasListChild(editor, listItem[0])) {
    const liType = editor.getType(KEYS.li);
    const _nodes = editor.read.nodes.entries({
      at: listItem[1],
      mode: 'lowest',
      match: (node, path) => {
        if (path.length === 0) {
          return false;
        }

        const isNodeLi = (node as Element).type === liType;
        const isSiblingOfNodeLi =
          editor.read.nodes.get<Element>(PathApi.next(path))?.[0].type ===
          liType;

        return isNodeLi && isSiblingOfNodeLi;
      },
    });
    const liWithSiblings = Array.from(_nodes, (entry) => entry[1])[0];

    if (!liWithSiblings) {
      // there are no more list item in the list
      const pointAfterListItem = editor.read.points.after(listItem[1]);

      if (pointAfterListItem) {
        // there is a block after it
        const nextSiblingListRes = getListItemEntry(editor, {
          at: pointAfterListItem,
        });

        if (nextSiblingListRes) {
          // it is a list so we merge the lists
          const listRoot = getListRoot(editor, listItem[1]);

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

    const siblingListItem = editor.read.nodes.get<Element>(
      PathApi.next(liWithSiblings)
    );

    if (!siblingListItem) return false;

    const siblingList = editor.read.nodes.parent<Element>(siblingListItem[1]);

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

    const selection = editor.read.selection();

    if (!selection) return false;

    const pointAfterListItem = editor.read.points.after(selection.focus);

    if (
      !pointAfterListItem ||
      !isAcrossListItems(editor, {
        anchor: selection.anchor,
        focus: pointAfterListItem,
      })
    ) {
      return false;
    }

    // get closest lic ancestor of next selectable
    const licType = editor.getType(KEYS.lic);
    const _licNodes = editor.read.nodes.entries<Element>({
      at: pointAfterListItem.path,
      mode: 'lowest',
      match: { type: licType },
    });
    const nextSelectableLic = [..._licNodes][0];

    // let slate handle single child cases
    if (nextSelectableLic[0].children.length < 2) return false;

    // manually run default delete
    defaultDelete(unit);

    const leftoverListItem = editor.read.nodes.get<Element>(
      PathApi.parent(nextSelectableLic[1])
    )!;

    if (leftoverListItem && leftoverListItem[0].children.length === 0) {
      // remove the leftover empty list item
      tx.nodes.remove({ at: leftoverListItem[1] });
    }

    return true;
  }

  // if it has children
  const nestedList = editor.read.nodes.get<Element>(
    PathApi.next([...listItem[1], 0])
  );

  if (!nestedList) return false;

  const nestedListItem = editor.read.nodes.get<Element>([...nestedList[1], 0]);

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

export const withDeleteForwardList: ExtendPlateEditorExtension<ListConfig> = ({
  editor,
}) => ({
  priority: 100,
  transforms: {
    deleteForward({ next, tx, unit }) {
      const selection = editor.read.selection();

      if (!selection || !editor.read.selection.isAtBlockEnd()) {
        return next({ unit });
      }

      const res = getListItemEntry(editor, {});

      if (!res) {
        return selectionIsNotInAListHandler(editor, tx) || next({ unit });
      }

      let delegated = false;
      const handled = selectionIsInAListHandler(
        editor,
        tx,
        res,
        (nextUnit) => {
          delegated = true;
          return next({ unit: nextUnit ?? unit });
        },
        unit
      );

      if (handled || delegated) return true;

      return next({ unit });
    },
  },
});
