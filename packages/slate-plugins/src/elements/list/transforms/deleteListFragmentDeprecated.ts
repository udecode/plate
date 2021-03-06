import { Ancestor, Editor, Node, Path, Range, Transforms } from 'slate';
import { findDescendant } from '../../../common/queries/findDescendant';
import { getLastChildPath } from '../../../common/queries/getLastChild';
import { getNode } from '../../../common/queries/getNode';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_LIST } from '../defaults';
import { getListItemEntry } from '../queries';
import { getListRoot } from '../queries/getListRoot';
import { getListTypes } from '../queries/getListTypes';
import { ListOptions } from '../types';
import { moveListItemsToList } from './moveListItemsToList';
import { moveListItemSublistItemsToListItemSublist } from './moveListItemSublistItemsToListItemSublist';
import { moveListSiblingsAfterCursor } from './moveListSiblingsAfterCursor';

export const deleteListFragmentDeprecated = (
  editor: Editor,
  selection: Range,
  options: ListOptions = {}
): number | undefined => {
  const [startSelection, endSelection] = Range.edges(selection);

  // Selection should contain multiple blocks.
  if (Path.equals(startSelection.path, endSelection.path)) return;

  const root = getListRoot(editor, endSelection, options);

  // End selection should be in a list.
  if (!root) return;

  const [rootNode, rootPath] = root;
  const { li } = setDefaults(options, DEFAULTS_LIST);
  let moved = 0;
  let deleted = false;

  Editor.withoutNormalizing(editor, () => {
    const listEnd = getListItemEntry(editor, { at: endSelection }, options);
    // End selection should be in a list item.
    if (!listEnd) return;

    let next: Path;
    let childrenMoved = 0;
    const { listItem: listItemEnd } = listEnd;

    if (Path.isBefore(startSelection.path, rootPath)) {
      // If start selection is before the root list.
      next = Path.next(rootPath);

      // Copy the root list after it.
      Transforms.insertNodes(
        editor,
        {
          type: rootNode.type,
          children: [],
        },
        { at: next }
      );

      const toListNode = getNode(editor, next);
      if (!toListNode) return;

      childrenMoved = moveListItemsToList(
        editor,
        {
          fromListItem: listItemEnd,
          toList: [toListNode as Ancestor, next],
        },
        options
      );

      // next is the first list item of the root copy.
      next = [...next, 0];
    } else {
      // If start selection is inside the root list.

      // Find the first list item that will not be deleted.
      const listStart = getListItemEntry(
        editor,
        { at: startSelection },
        options
      );
      if (!listStart) return;

      const { listItem: listItemStart } = listStart;
      const listItemSublist = findDescendant<Ancestor>(editor, {
        at: listItemStart[1],
        match: {
          type: getListTypes(options),
        },
      });

      childrenMoved = moveListItemSublistItemsToListItemSublist(
        editor,
        {
          fromListItem: listItemEnd,
          toListItem: listItemStart,
        },
        options
      );

      next = listItemSublist
        ? Path.next(getLastChildPath(listItemSublist))
        : listItemStart[1].concat([1, 0]);
    }

    // Move siblings outside of deleted fragment
    let cursorPath = endSelection.path;
    let siblingsMoved = 0;
    next = [...next.slice(0, -1), next[next.length - 1] + childrenMoved];

    while (Path.isAfter(cursorPath, startSelection.path)) {
      const node = Node.get(editor, cursorPath);
      if (node.type === li.type) {
        siblingsMoved += moveListSiblingsAfterCursor(
          editor,
          { at: cursorPath, to: next },
          options
        );
      }
      cursorPath = Path.parent(cursorPath);
    }

    // Move done. We can delete the fragment.
    Transforms.delete(editor, { at: selection });

    deleted = true;
    moved = siblingsMoved + childrenMoved;
  });

  return deleted ? moved : undefined;
};
