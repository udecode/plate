import {
  Ancestor,
  Editor,
  Element,
  Node,
  NodeEntry,
  Path,
  Range,
  Transforms,
} from 'slate';
import { moveChildren } from '../../../common/transforms/moveChildren';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_LIST } from '../defaults';
import { isSelectionInListItem } from '../queries';
import { getListRoot } from '../queries/getListRoot';
import { ListOptions } from '../types';

function moveChildrenListItems(
  editor: Editor,
  listItemNode: Ancestor,
  listItemPath: Path,
  targetListPath: Path,
  {
    ul = DEFAULTS_LIST.ul,
    ol = DEFAULTS_LIST.ol,
    li = DEFAULTS_LIST.li,
  }: Pick<ListOptions, 'ul' | 'ol' | 'li'>
): number {
  if (listItemNode.type !== li.type) return 0;

  let moved = 0;

  for (let i = 0; i < listItemNode.children.length; i++) {
    const childNode = listItemNode.children[i];
    if (
      Editor.isBlock(editor, childNode) &&
      (childNode.type === ul.type || childNode.type === ol.type)
    ) {
      const listPath = [...listItemPath, i];
      moved +=
        moveChildren(editor, [childNode, listPath], targetListPath, {
          pass: ([node]) => node.type === li.type,
        }) ?? 0;
      // Remove the empty list
      Transforms.delete(editor, { at: listPath });
    }
  }
  return moved;
}

function moveListSiblingsAfterCursor(
  editor: Editor,
  cursor: Path,
  targetPath: Path,
  {
    ul = DEFAULTS_LIST.ul,
    ol = DEFAULTS_LIST.ol,
  }: Pick<ListOptions, 'ul' | 'ol'>
): number {
  const offset = cursor[cursor.length - 1];
  cursor = Path.parent(cursor);
  const listNode = Node.get(editor, cursor);
  const listEntry: NodeEntry = [listNode, cursor];
  if (
    (listNode.type !== ul.type && listNode.type !== ol.type) ||
    Path.isParent(cursor, targetPath) // avoid moving nodes within its own list
  )
    return 0;

  const moved =
    moveChildren(editor, listEntry, targetPath, {
      start: offset + 1,
    }) ?? 0;
  return moved;
}

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
    const endListResult = isSelectionInListItem(editor, {
      ...options,
      at: endSelection,
    });
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
      const startListResult = isSelectionInListItem(editor, {
        ...options,
        at: startSelection,
      });
      if (!startListResult) return;

      const { listItemNode, listItemPath } = startListResult;
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
    const { listItemNode, listItemPath } = endListResult;
    const childrenMoved = moveChildrenListItems(
      editor,
      listItemNode,
      listItemPath,
      next,
      options
    );

    // move siblings outside of deleted fragment
    let cursor = endSelection.path;
    let siblingsMoved = 0;
    next = [...next.slice(0, -1), next[next.length - 1] + childrenMoved];
    while (Path.isAfter(cursor, startSelection.path)) {
      const node = Node.get(editor, cursor);
      if (node.type === li.type) {
        siblingsMoved += moveListSiblingsAfterCursor(
          editor,
          cursor,
          next,
          options
        );
      }
      cursor = Path.parent(cursor);
    }

    // delete the fragment
    Transforms.delete(editor, { at: selection });

    moved = siblingsMoved + childrenMoved;
  });

  return moved;
}
