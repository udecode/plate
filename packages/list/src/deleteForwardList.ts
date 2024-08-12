import {
  type PlateEditor,
  type TElement,
  type TElementEntry,
  getBlockAbove,
  getChildren,
  getEditorString,
  getNode,
  getNodeEntries,
  getNodeEntry,
  getParentNode,
  getPluginType,
  getPointAfter,
  isSelectionAtBlockEnd,
  removeNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Path, type TextUnit } from 'slate';

import { ELEMENT_LI, ELEMENT_LIC } from './ListPlugin';
import {
  getListItemEntry,
  getListRoot,
  hasListChild,
  isAcrossListItems,
} from './queries/index';
import {
  moveListItemUp,
  moveListItemsToList,
  removeFirstListItem,
  removeListItem,
} from './transforms/index';

const selectionIsNotInAListHandler = (editor: PlateEditor): boolean => {
  const pointAfterSelection = getPointAfter(
    editor,
    editor.selection!.focus.path
  );

  if (pointAfterSelection) {
    // there is a block after it
    const nextSiblingListRes = getListItemEntry(editor, {
      at: pointAfterSelection,
    });

    if (nextSiblingListRes) {
      // the next block is a list
      const { listItem } = nextSiblingListRes;
      const parentBlockEntity = getBlockAbove(editor, {
        at: editor.selection!.anchor,
      });

      if (!getEditorString(editor, parentBlockEntity![1])) {
        // the selected block is empty
        removeNodes(editor);

        return true;
      }
      if (hasListChild(editor, listItem[0])) {
        // the next block has children, so we have to move the first item up
        const sublistRes = getListItemEntry(editor, {
          at: [...listItem[1], 1, 0, 0],
        });

        moveListItemUp(editor, sublistRes!);
      }
    }
  }

  return false;
};

const selectionIsInAListHandler = (
  editor: PlateEditor,
  res: { list: TElementEntry; listItem: TElementEntry },
  defaultDelete: (unit: TextUnit) => void,
  unit: 'block' | 'character' | 'line' | 'word'
): boolean => {
  const { listItem } = res;

  // if it has no children
  if (!hasListChild(editor, listItem[0])) {
    const liType = getPluginType(editor, ELEMENT_LI);
    const _nodes = getNodeEntries(editor, {
      at: listItem[1],
      match: (node, path) => {
        if (path.length === 0) {
          return false;
        }

        const isNodeLi = (node as TElement).type === liType;
        const isSiblingOfNodeLi =
          getNode<TElement>(editor, Path.next(path))?.type === liType;

        return isNodeLi && isSiblingOfNodeLi;
      },
      mode: 'lowest',
    });
    const liWithSiblings = Array.from(_nodes, (entry) => entry[1])[0];

    if (!liWithSiblings) {
      // there are no more list item in the list
      const pointAfterListItem = getPointAfter(editor, listItem[1]);

      if (pointAfterListItem) {
        // there is a block after it
        const nextSiblingListRes = getListItemEntry(editor, {
          at: pointAfterListItem,
        });

        if (nextSiblingListRes) {
          // it is a list so we merge the lists
          const listRoot = getListRoot(editor, listItem[1]);

          moveListItemsToList(editor, {
            deleteFromList: true,
            fromList: nextSiblingListRes.list,
            toList: listRoot,
          });

          return true;
        }
      }

      return false;
    }

    const siblingListItem = getNodeEntry<TElement>(
      editor,
      Path.next(liWithSiblings)
    );

    if (!siblingListItem) return false;

    const siblingList = getParentNode<TElement>(editor, siblingListItem[1]);

    if (
      siblingList &&
      removeListItem(editor, {
        list: siblingList,
        listItem: siblingListItem,
        reverse: false,
      })
    ) {
      return true;
    }

    const pointAfterListItem = getPointAfter(editor, editor.selection!.focus);

    if (
      !pointAfterListItem ||
      !isAcrossListItems({
        ...editor,
        selection: {
          anchor: editor.selection!.anchor,
          focus: pointAfterListItem,
        },
      })
    ) {
      return false;
    }

    // get closest lic ancestor of next selectable
    const licType = getPluginType(editor, ELEMENT_LIC);
    const _licNodes = getNodeEntries<TElement>(editor, {
      at: pointAfterListItem.path,
      match: (node) => node.type === licType,
      mode: 'lowest',
    });
    const nextSelectableLic = [..._licNodes][0];

    // let slate handle single child cases
    if (nextSelectableLic[0].children.length < 2) return false;

    // manually run default delete
    defaultDelete(unit);

    const leftoverListItem = getNodeEntry<TElement>(
      editor,
      Path.parent(nextSelectableLic[1])
    )!;

    if (leftoverListItem && leftoverListItem[0].children.length === 0) {
      // remove the leftover empty list item
      removeNodes(editor, { at: leftoverListItem[1] });
    }

    return true;
  }

  // if it has children
  const nestedList = getNodeEntry<TElement>(
    editor,
    Path.next([...listItem[1], 0])
  );

  if (!nestedList) return false;

  const nestedListItem = getChildren<TElement>(nestedList)[0];

  if (
    removeFirstListItem(editor, {
      list: nestedList,
      listItem: nestedListItem,
    })
  ) {
    return true;
  }
  if (
    removeListItem(editor, {
      list: nestedList,
      listItem: nestedListItem,
    })
  ) {
    return true;
  }

  return false;
};

export const deleteForwardList = (
  editor: PlateEditor,
  defaultDelete: (unit: TextUnit) => void,
  unit: TextUnit
) => {
  let skipDefaultDelete = false;

  if (!editor?.selection) {
    return skipDefaultDelete;
  }
  if (!isSelectionAtBlockEnd(editor)) {
    return skipDefaultDelete;
  }

  withoutNormalizing(editor, () => {
    const res = getListItemEntry(editor, {});

    if (!res) {
      skipDefaultDelete = selectionIsNotInAListHandler(editor);

      return;
    }

    skipDefaultDelete = selectionIsInAListHandler(
      editor,
      res,
      defaultDelete,
      unit
    );
  });

  return skipDefaultDelete;
};
