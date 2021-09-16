import {
  getChildren,
  getNode,
  isSelectionAtBlockEnd,
} from '@udecode/plate-common';
import {
  getPlatePluginOptions,
  SPEditor,
  TDescendant,
} from '@udecode/plate-core';
import { Editor, Node, NodeEntry, Path } from 'slate';
import { ELEMENT_LI } from './defaults';
import { getListItemEntry, hasListChild } from './queries';
import { removeFirstListItem, removeListItem } from './transforms';

const pathToEntry = <T extends Node>(
  editor: SPEditor,
  path: Path
): NodeEntry<T> => Editor.node(editor, path) as NodeEntry<T>;

export const getListDeleteForward = (editor: SPEditor) => {
  const res = getListItemEntry(editor, {});

  let moved: boolean | undefined = false;
  if (!isSelectionAtBlockEnd(editor) || !res) {
    return moved;
  }

  Editor.withoutNormalizing(editor, () => {
    const { listItem } = res;

    if (!hasListChild(editor, listItem[0])) {
      const li = getPlatePluginOptions(editor, ELEMENT_LI);
      const liWithSiblings = Array.from(
        Editor.nodes(editor, {
          at: listItem[1],
          mode: 'lowest',
          match: (node: TDescendant, path) => {
            if (path.length === 0) {
              return false;
            }

            const isNodeLi = node.type === li.type;
            const isSiblingOfNodeLi =
              (getNode(editor, Path.next(path)) as TDescendant)?.type ===
              li.type;

            return isNodeLi && isSiblingOfNodeLi;
          },
        }),
        (entry) => entry[1]
      )[0];

      if (!liWithSiblings) {
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
      if (moved) return;

      return;
    }

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
