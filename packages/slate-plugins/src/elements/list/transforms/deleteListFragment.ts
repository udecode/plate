import { Editor, Element, Node, Path, Range, Transforms } from 'slate';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_LIST } from '../defaults';
import { getListItemEntry } from '../queries';
import { getListRoot } from '../queries/getListRoot';
import { ListOptions } from '../types';
import { moveChildrenListItems } from './moveChildrenListItems';
import { moveListSiblingsAfterCursor } from './moveListSiblingsAfterCursor';

export function deleteListFragment(
  editor: Editor,
  selection: Range,
  options: ListOptions = {}
): number | undefined {
  const [startSelection, endSelection] = Range.edges(selection);
  if (Path.equals(startSelection.path, endSelection.path)) return; // only handle deletes across list items
  const root = getListRoot(editor, endSelection, options);
  if (!root) return; // end is outside of a list
  const [rootNode, rootPath] = root;
  const { li, ul, ol } = setDefaults(options, DEFAULTS_LIST);
  let moved;

  Editor.withoutNormalizing(editor, () => {
    const endListResult = getListItemEntry(
      editor,
      {
        at: endSelection,
      },
      options
    );
    if (!endListResult) return;

    let next: Path;
    if (Path.isBefore(startSelection.path, rootPath)) {
      next = Path.next(rootPath);
      // we are deleting the top of the list
      // create a new list to copy list items
      Transforms.insertNodes(
        editor,
        {
          type: rootNode.type,
          children: [],
        },
        { at: next }
      );
      next = [...next, 0];
    } else {
      // find the first list item that will not be deleted
      const res = getListItemEntry(
        editor,
        {
          at: startSelection,
        },
        options
      );
      if (!res) return;
      const { listItem } = res;
      const [listItemNode, listItemPath] = listItem;

      const childListIndex = listItemNode.children.findIndex(
        (node) => node.type === ul.type || node.type === ol.type
      );
      if (childListIndex === -1) {
        // there's no child list to move dangling list items, create one
        const at = [...listItemPath, listItemNode.children.length];
        Transforms.insertNodes(
          editor,
          {
            type: rootNode.type,
            children: [],
          },
          { at }
        );
        next = [...at, 0];
      } else {
        const childList = listItemNode.children[childListIndex] as Element;
        next = [...listItemPath, childListIndex, childList.children.length];
      }
    }

    // move all children into target list
    const { listItem } = endListResult;

    const childrenMoved = moveChildrenListItems(
      editor,
      { listItem, targetListPath: next },
      options
    );

    // move siblings outside of deleted fragment
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

    // delete the fragment
    Transforms.delete(editor, { at: selection });

    moved = siblingsMoved + childrenMoved;
  });

  return moved;
}
