import { Ancestor, Editor, NodeEntry, Path, Transforms } from 'slate';
import { getParent } from '../../../common/queries/getParent';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_LIST } from '../defaults';
import { ListOptions } from '../types';

export interface MoveListItemUpOptions {
  list: NodeEntry<Ancestor>;
  listItem: NodeEntry<Ancestor>;
}

/**
 * Move a list item next to its parent.
 * The parent should be a list item.
 */
export const moveListItemUp = (
  editor: Editor,
  { list, listItem }: MoveListItemUpOptions,
  options?: ListOptions
) => {
  const { li } = setDefaults(options, DEFAULTS_LIST);

  const [listNode, listPath] = list;
  const [, listItemPath] = listItem;

  const listParentEntry = getParent(editor, listPath);
  if (!listParentEntry) return;
  const [listParentNode, listParentPath] = listParentEntry;

  if (listParentNode.type !== li.type) return;

  const newListItemPath = Path.next(listParentPath);

  // Move item one level up
  Transforms.moveNodes(editor, {
    at: listItemPath,
    to: newListItemPath,
  });

  /**
   * Move the next siblings to a new list
   */
  const listItemIdx = listItemPath[listItemPath.length - 1];
  const siblingPath = [...listItemPath];
  const newListPath = newListItemPath.concat(1);
  let siblingFound = false;
  let newSiblingIdx = 0;
  listNode.children.forEach((n, idx) => {
    if (listItemIdx < idx) {
      if (!siblingFound) {
        siblingFound = true;

        Transforms.insertNodes(
          editor,
          {
            type: listNode.type,
            children: [],
          },
          { at: newListPath }
        );
      }

      siblingPath[siblingPath.length - 1] = listItemIdx;
      const newSiblingsPath = newListPath.concat(newSiblingIdx);
      newSiblingIdx++;
      Transforms.moveNodes(editor, {
        at: siblingPath,
        to: newSiblingsPath,
      });
    }
  });

  // Remove sublist if it was the first list item
  if (!listItemIdx) {
    Transforms.removeNodes(editor, {
      at: listPath,
    });
  }

  return true;
};
