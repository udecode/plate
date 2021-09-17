import {
  getBlockAbove,
  getChildren,
  getNode,
  getText,
  hasTexts,
  isSelectionAtBlockEnd,
} from '@udecode/plate-common';
import {
  getPlatePluginType,
  SPEditor,
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
  editor: SPEditor,
  path: Path
): NodeEntry<T> => Editor.node(editor, path) as NodeEntry<T>;

export const getListDeleteForward = (editor: SPEditor) => {
  const res = getListItemEntry(editor, {});

  let moved: boolean | undefined = false;
  if (!isSelectionAtBlockEnd(editor)) {
    return moved;
  }

  if (!res) {
    const afterPoint = Editor.after(editor, editor.selection!.focus.path);

    if (afterPoint) {
      // there is a block after it
      const nextSiblingListRes = getListItemEntry(editor, {
        at: afterPoint.path,
      });

      if (nextSiblingListRes) {
        // the next block is a list
        const { listItem } = nextSiblingListRes;
        const parentBlockEntity = getBlockAbove(editor, {
          at: editor.selection!.anchor,
        });

        if (!getText(editor, parentBlockEntity![1])) {
          // the selected block is empty
          Transforms.removeNodes(editor, { at: editor.selection!.focus });

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
  }

  Editor.withoutNormalizing(editor, () => {
    const { listItem } = res;

    // if it has no children
    if (!hasListChild(editor, listItem[0])) {
      const liType = getPlatePluginType(editor, ELEMENT_LI);
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
              (getNode(editor, Path.next(path)) as TDescendant)?.type ===
              liType;

            return isNodeLi && isSiblingOfNodeLi;
          },
        }),
        (entry) => entry[1]
      )[0];

      if (!liWithSiblings) {
        // there are no more list item in the list
        const afterPoint = Editor.after(editor, listItem[1]);

        if (afterPoint) {
          // there is a block after it
          const nextSiblingListRes = getListItemEntry(editor, {
            at: afterPoint.path,
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

            moved = true;

            return;
          }
        }

        return;
      }

      const siblingListItem: NodeEntry<TDescendant> = pathToEntry(
        editor,
        Path.next(liWithSiblings)
      );

      const siblingList: NodeEntry<TDescendant> = Editor.parent(
        editor,
        siblingListItem[1]
      );

      moved = removeListItem(editor, {
        list: siblingList,
        listItem: siblingListItem,
        reverse: false,
      });

      return;
    }

    // if it has children
    const nestedList = pathToEntry<TDescendant>(
      editor,
      Path.next([...listItem[1], 0])
    );
    const nestedListItem = getChildren<TDescendant>(nestedList)[0];

    moved = removeFirstListItem(editor, {
      list: nestedList,
      listItem: nestedListItem,
    });
    if (moved) return;

    moved = removeListItem(editor, {
      list: nestedList,
      listItem: nestedListItem,
    });
  });

  return moved;
};
