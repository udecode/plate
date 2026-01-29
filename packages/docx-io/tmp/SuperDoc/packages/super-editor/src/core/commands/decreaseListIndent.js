import { ListHelpers } from '@helpers/list-numbering-helpers.js';

/**
 * Decreases the indent level of the current list item.
 * If the current item is at level 0, it converts it to a paragraph.
 * If the current item is at level 1 or higher, it decreases the level and updates the list structure.
 * @returns {Function} A ProseMirror command function.
 */
export const decreaseListIndent =
  () =>
  ({ editor, tr }) => {
    const { state } = editor;
    const currentNode = ListHelpers.getCurrentListItem(state);
    if (!currentNode) return false;

    const parentList = ListHelpers.getParentOrderedList(state);
    if (!parentList) return false;

    const currentLevel = currentNode.node.attrs.level;
    const newLevel = currentLevel - 1;

    // Don't allow negative levels
    if (newLevel < 0) {
      return false;
    }

    const numId = currentNode.node.attrs.numId;

    tr.setNodeMarkup(currentNode.pos, null, {
      ...currentNode.node.attrs,
      level: newLevel,
      numId: numId,
    });

    return true;
  };
