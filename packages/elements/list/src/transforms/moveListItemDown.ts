import { match, wrapNodes } from '@udecode/plate-common';
import { SPEditor, TElement } from '@udecode/plate-core';
import { Ancestor, Editor, Element, NodeEntry, Path, Transforms } from 'slate';
import { getListTypes } from '../queries/getListTypes';

export interface MoveListItemDownOptions {
  list: NodeEntry<TElement>;
  listItem: NodeEntry<TElement>;
}

export const moveListItemDown = (
  editor: SPEditor,
  { list, listItem }: MoveListItemDownOptions
) => {
  const [listNode] = list;
  const [, listItemPath] = listItem;

  let previousListItemPath: Path;

  try {
    previousListItemPath = Path.previous(listItemPath);
  } catch (e) {
    return;
  }

  // Previous sibling is the new parent
  const previousSiblingItem = Editor.node(
    editor,
    previousListItemPath
  ) as NodeEntry<Ancestor>;

  if (previousSiblingItem) {
    const [previousNode, previousPath] = previousSiblingItem;

    const sublist = previousNode.children.find((n) =>
      match(n, { type: getListTypes(editor) })
    ) as Element | undefined;
    const newPath = previousPath.concat(
      sublist ? [1, sublist.children.length] : [1]
    );

    if (!sublist) {
      // Create new sublist
      wrapNodes(
        editor,
        { type: listNode.type, children: [] },
        { at: listItemPath }
      );
    }

    // Move the current item to the sublist
    Transforms.moveNodes(editor, {
      at: listItemPath,
      to: newPath,
    });
  }
};
