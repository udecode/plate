import type { BaseEditor } from '@platejs/core';
import { type Element, type ElementEntry, PathApi } from '@platejs/plite';

import type { ListTransaction } from '../BaseListPlugin';

import { getListTypes } from '../queries/index';

// When pasting from e.g. Google Docs, the structure of nested lists like "ul -> ul"
// should be normalized to "ul -> li -> lic + ul".
// In other words, a nested list as a direct children of a list should be moved into a previous list item sibling
export const normalizeNestedList = (
  editor: BaseEditor,
  tx: ListTransaction,
  { nestedListItem }: { nestedListItem: ElementEntry }
) => {
  const [, path] = nestedListItem;

  const parentNode = editor.read.nodes.parent(path);
  const hasParentList =
    parentNode &&
    getListTypes(editor).includes((parentNode[0] as Element).type);

  if (!hasParentList) {
    return false;
  }

  if (!PathApi.hasPrevious(path)) return false;

  const previousListItemPath = PathApi.previous(path);

  // Previous sibling is the new parent
  const previousSiblingItem = editor.read.nodes.get(previousListItemPath);

  if (previousSiblingItem) {
    const [, previousPath] = previousSiblingItem;
    const newPath = previousPath.concat([1]);

    // Move the current item to the sublist
    tx.nodes.move({
      at: path,
      to: newPath,
    });

    return true;
  }
};
