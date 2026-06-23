import type { BasePlateEditor } from '@platejs/core';
import type { EditorUpdateTransaction, ElementEntry } from '@platejs/plite';
import { ElementApi } from '@platejs/plite';

import { getListTypes, getPreviousSiblingPath } from '../queries/index';

type NormalizeNestedListTransaction = {
  nodes: Pick<EditorUpdateTransaction['nodes'], 'move'>;
};

// When pasting from e.g. Google Docs, the structure of nested lists like "ul -> ul"
// should be normalized to "ul -> li -> lic + ul".
// In other words, a nested list as a direct children of a list should be moved into a previous list item sibling
export const normalizeNestedList = (
  editor: BasePlateEditor,
  {
    nestedListItem,
    tx,
  }: { nestedListItem: ElementEntry; tx?: NormalizeNestedListTransaction }
) => {
  const [, path] = nestedListItem;

  const parentNode = editor.api.parent(path);
  const hasParentList =
    parentNode &&
    ElementApi.isElement(parentNode[0]) &&
    getListTypes(editor).includes(parentNode[0].type);

  if (!hasParentList) {
    return false;
  }

  const previousListItemPath = getPreviousSiblingPath(path);

  if (!previousListItemPath) {
    return false;
  }

  // Previous sibling is the new parent
  const previousSiblingItem = editor.api.node(previousListItemPath);

  if (previousSiblingItem) {
    const [, previousPath] = previousSiblingItem;
    const newPath = previousPath.concat([1]);

    // Move the current item to the sublist
    const move = (transaction: NormalizeNestedListTransaction) => {
      transaction.nodes.move({
        at: path,
        to: newPath,
      });
    };

    if (tx) {
      move(tx);
    } else {
      editor.update(move);
    }

    return true;
  }
};
