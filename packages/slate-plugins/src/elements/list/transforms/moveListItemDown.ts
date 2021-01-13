import { Ancestor, Editor, Element, NodeEntry, Path, Transforms } from 'slate';
import { match } from '../../../common/utils/match';
import { getListTypes } from '../queries/getListTypes';
import { ListOptions } from '../types';

export interface MoveListItemDownOptions {
  list: NodeEntry<Ancestor>;
  listItem: NodeEntry<Ancestor>;
}

export const moveListItemDown = (
  editor: Editor,
  { list, listItem }: MoveListItemDownOptions,
  options?: ListOptions
) => {
  const [listNode] = list;
  const [, listItemPath] = listItem;

  // Previous sibling is the new parent
  const previousSiblingItem = Editor.node(
    editor,
    Path.previous(listItemPath)
  ) as NodeEntry<Ancestor>;

  if (previousSiblingItem) {
    const [previousNode, previousPath] = previousSiblingItem;

    const sublist = previousNode.children.find((n) =>
      match(n, { type: getListTypes(options) })
    ) as Element | undefined;
    const newPath = previousPath.concat(
      sublist ? [1, sublist.children.length] : [1]
    );

    if (!sublist) {
      // Create new sublist
      Transforms.wrapNodes(
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
