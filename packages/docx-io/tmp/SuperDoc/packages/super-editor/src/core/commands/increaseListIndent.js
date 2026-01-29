import { ListHelpers } from '@helpers/list-numbering-helpers.js';

/**
 * Increases the indent level of the current list item.
 * @returns {Function} A ProseMirror command function.
 */
export const increaseListIndent =
  () =>
  ({ editor, tr }) => {
    const { state } = editor;
    const currentNode = ListHelpers.getCurrentListItem(state);
    if (!currentNode) return false;

    const parentList = ListHelpers.getParentOrderedList(state);
    if (!parentList) return false;

    const newLevel = currentNode.node.attrs.level + 1;
    const numId = currentNode.node.attrs.numId;

    tr.setNodeMarkup(currentNode.pos, null, {
      ...currentNode.node.attrs,
      level: newLevel,
      numId: numId,
    });

    return true;
  };
