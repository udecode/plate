import { Ancestor, Editor, Element, NodeEntry, Path, Transforms } from 'slate';
import { isList } from '../queries/isList';
import { ListOptions } from '../types';

export const moveListItemDown = (
  editor: Editor,
  listNode: Ancestor,
  listItemPath: number[],
  options?: ListOptions
) => {
  // Previous sibling is the new parent
  const previousSiblingItem = Editor.node(
    editor,
    Path.previous(listItemPath)
  ) as NodeEntry<Ancestor>;

  if (previousSiblingItem) {
    const [previousNode, previousPath] = previousSiblingItem;

    const sublist = previousNode.children.find(isList(options)) as
      | Element
      | undefined;
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
