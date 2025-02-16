import {
  type ElementEntry,
  type SlateEditor,
  match,
  PathApi,
} from '@udecode/plate';

import { getListTypes } from '../queries/index';

// When pasting from e.g. Google Docs, the structure of nested lists like "ul -> ul"
// should be normalized to "ul -> li -> lic + ul".
// In other words, a nested list as a direct children of a list should be moved into a previous list item sibling
export const normalizeNestedList = (
  editor: SlateEditor,
  { nestedListItem }: { nestedListItem: ElementEntry }
) => {
  const [, path] = nestedListItem;

  const parentNode = editor.api.parent(path);
  const hasParentList =
    parentNode && match(parentNode[0], [], { type: getListTypes(editor) });

  if (!hasParentList) {
    return false;
  }

  const previousListItemPath = PathApi.previous(path);

  if (!previousListItemPath) {
    return false;
  }

  // Previous sibling is the new parent
  const previousSiblingItem = editor.api.node(previousListItemPath);

  if (previousSiblingItem) {
    const [, previousPath] = previousSiblingItem;
    const newPath = previousPath.concat([1]);

    // Move the current item to the sublist
    editor.tf.moveNodes({
      at: path,
      to: newPath,
    });

    return true;
  }
};
