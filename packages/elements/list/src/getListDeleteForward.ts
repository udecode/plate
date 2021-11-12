import {
  getBlockAbove,
  getChildren,
  getNode,
  getText,
  isSelectionAtBlockEnd,
} from '@udecode/plate-common';
import {
  getPluginType,
  PlateEditor,
  TDescendant,
  TElement,
} from '@udecode/plate-core';
import { Editor, Node, NodeEntry, Path, Transforms } from 'slate';
import { ELEMENT_LI } from './defaults';
import { getListItemEntry, getListRoot, hasListChild } from './queries';
import {
  moveListItemsToList,
  moveListItemUp,
  removeFirstListItem,
  removeListItem,
} from './transforms';

const pathToEntry = <T extends Node>(
  editor: PlateEditor,
  path: Path
): NodeEntry<T> => Editor.node(editor, path) as NodeEntry<T>;

const selectionIsNotInAListHandler = (editor: PlateEditor): boolean => {
  const pointAfterSelection = Editor.after(
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

      if (!getText(editor, parentBlockEntity![1])) {
        // the selected block is empty
        Transforms.removeNodes(editor);

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
  res: { list: NodeEntry<TElement>; listItem: NodeEntry<TElement> }
): boolean => {
  const { listItem } = res;

  // if it has no children
  if (!hasListChild(editor, listItem[0])) {
    const liType = getPluginType(editor, ELEMENT_LI);
    const liWithSiblings = Array.from(
      Editor.nodes(editor, {
        at: listItem[1],
        mode: 'lowest',
        match: (node: TDescendant, path) => {
          if (path.length === 0) {
            return false;
          }

          const isNodeLi = node.type === liType;
          const isSiblingOfNodeLi =
            (getNode(editor, Path.next(path)) as TDescendant)?.type === liType;

          return isNodeLi && isSiblingOfNodeLi;
        },
      }),
      (entry) => entry[1]
    )[0];

    if (!liWithSiblings) {
      // there are no more list item in the list
      const pointAfterListItem = Editor.after(editor, listItem[1]);

      if (pointAfterListItem) {
        // there is a block after it
        const nextSiblingListRes = getListItemEntry(editor, {
          at: pointAfterListItem,
        });

        if (nextSiblingListRes) {
          // it is a list so we merge the lists
          const listRoot = getListRoot(
            editor,
            listItem[1]
          ) as NodeEntry<TElement>;

          moveListItemsToList(editor, {
            fromList: nextSiblingListRes.list,
            toList: listRoot,
            deleteFromList: true,
          });

          return true;
        }
      }

      return false;
    }

    const siblingListItem: NodeEntry<TDescendant> = pathToEntry(
      editor,
      Path.next(liWithSiblings)
    );

    const siblingList: NodeEntry<TDescendant> = Editor.parent(
      editor,
      siblingListItem[1]
    );

    if (
      removeListItem(editor, {
        list: siblingList,
        listItem: siblingListItem,
        reverse: false,
      })
    ) {
      return true;
    }

    // if (skipDefaultDelete) return skipDefaultDelete;

    return false;
  }

  // if it has children
  const nestedList = pathToEntry<TDescendant>(
    editor,
    Path.next([...listItem[1], 0])
  );
  const nestedListItem = getChildren<TDescendant>(nestedList)[0];

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

export const getListDeleteForward = (editor: PlateEditor) => {
  let skipDefaultDelete = false;

  if (!editor?.selection) {
    return skipDefaultDelete;
  }

  if (!isSelectionAtBlockEnd(editor)) {
    return skipDefaultDelete;
  }

  Editor.withoutNormalizing(editor, () => {
    const res = getListItemEntry(editor, {});

    if (!res) {
      skipDefaultDelete = selectionIsNotInAListHandler(editor);
      return;
    }

    skipDefaultDelete = selectionIsInAListHandler(editor, res);
  });

  return skipDefaultDelete;
};
