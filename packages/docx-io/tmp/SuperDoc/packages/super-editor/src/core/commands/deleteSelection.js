import { deleteSelection as originalDeleteSelection } from 'prosemirror-commands';
import { Fragment } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';

/**
 * Delete the selection, if there is one.
 */
//prettier-ignore
export const deleteSelection = () => ({ state, tr, dispatch }) => {
  const { from, to, empty } = state.selection;
  
  if (empty) {
    return originalDeleteSelection(state, dispatch);
  }

  let hasListContent = false;
  state.doc.nodesBetween(from, to, (node) => {
    if (node.type.name === 'orderedList' || 
        node.type.name === 'bulletList' ||
        node.type.name === 'listItem') {
      hasListContent = true;
      return false;
    }
  });

  if (hasListContent) {
    const transaction = tr || state.tr;
    transaction.deleteRange(from, to);
    
    if (dispatch) {
      dispatch(transaction);
    }
  
    return true;
  }

  return originalDeleteSelection(state, dispatch);
};

/**
 * Helper function to find the position of a target node in the document.
 * @param {Node} doc - The ProseMirror document to search in.
 * @param {Node} targetNode - The ProseMirror node to find the position of.
 * @returns {number|null} The position of the target node in the document, or null
 */
const findNodePosition = (doc, targetNode) => {
  let nodePos = null;
  doc.descendants((node, pos) => {
    if (node === targetNode) {
      nodePos = pos;
      return false;
    }
  });
  return nodePos;
};

/**
 * Helper function to check if a node is a list.
 * @param {Node} n - The ProseMirror node to check.
 * @returns {boolean} True if the node is an ordered or bullet list, false otherwise
 */
const isList = (n) => n.type.name === 'orderedList' || n.type.name === 'bulletList';

/**
 * Handles the backspace key when the cursor is at the start of a paragraph next to a list.
 * It merges the paragraph content into the last list item of the previous list.
 * @param {Object} param0 - The ProseMirror command parameters.
 * @param {Object} param0.state - The ProseMirror editor state.
 * @param {Function} param0.dispatch - The function to dispatch a transaction.
 * @returns {boolean} Returns true if the command was handled, false otherwise.
 */
export const handleBackspaceNextToList =
  () =>
  ({ state, dispatch }) => {
    const { selection, doc } = state;
    const { $from } = selection;

    if (!selection.empty) return false;
    if ($from.parent.type.name !== 'paragraph') return false;
    if ($from.parentOffset !== 0) return false; // Only at start of paragraph

    const parentDepth = $from.depth - 1;
    if (parentDepth < 0) return false;
    const container = $from.node(parentDepth);
    const idx = $from.index(parentDepth);

    // Must have a node before us
    if (idx === 0) return false;

    const beforeNode = container.child(idx - 1);
    if (!beforeNode || !isList(beforeNode)) return false;

    const listItem = beforeNode.lastChild;
    if (!listItem || listItem.type.name !== 'listItem') return false;

    const targetPara = listItem.lastChild;
    if (!targetPara || targetPara.type.name !== 'paragraph') return false;

    const paraStartPos = findNodePosition(doc, targetPara);
    if (paraStartPos == null) return false;

    const inlineContent = Fragment.from($from.parent.content);
    const tr = state.tr;
    tr.setMeta('updateListSync', true);

    const oldParaPos = $from.before();

    tr.delete(oldParaPos, oldParaPos + $from.parent.nodeSize);

    const insertPos = paraStartPos + 1 + targetPara.content.size;
    tr.insert(insertPos, inlineContent);

    tr.setSelection(TextSelection.near(tr.doc.resolve(insertPos), 1));

    dispatch(tr);
    return true;
  };

/**
 * Handles the delete key when the cursor is at the end of a paragraph next to a list.
 * It merges the paragraph content into the first list item of the next list.
 * @param {Object} param0 - The ProseMirror command parameters.
 * @param {Object} param0.state - The ProseMirror editor state.
 * @param {Function} param0.dispatch - The function to dispatch a transaction.
 * @returns {boolean} Returns true if the command was handled, false otherwise.
 */
export const handleDeleteNextToList =
  () =>
  ({ state, dispatch }) => {
    const { selection, doc } = state;
    const { $from } = selection;

    if (!selection.empty) return false;
    if ($from.parent.type.name !== 'paragraph') return false;
    if ($from.parentOffset !== $from.parent.content.size) return false; // Only at end of paragraph

    // Check if we're inside a list item
    let currentDepth = $from.depth;
    let listItemDepth = -1;

    while (currentDepth > 0) {
      const node = $from.node(currentDepth - 1);
      if (node.type.name === 'listItem') {
        listItemDepth = currentDepth - 1;
        break;
      }
      currentDepth--;
    }

    if (listItemDepth !== -1) {
      // We're inside a list item - handle list-to-list merging
      const listDepth = listItemDepth - 1;
      const list = $from.node(listDepth);
      const listItemIdx = $from.index(listDepth);
      const listContainer = $from.node(listDepth - 1);
      const listIdx = $from.index(listDepth - 1);

      // Check if we're at the last item in this list
      if (listItemIdx < list.childCount - 1) {
        // There's another list item in the same list - prevent merging
        return true;
      }

      // We're at the last item, check what's after the list
      if (listIdx >= listContainer.childCount - 1) return false;

      const nextNode = listContainer.child(listIdx + 1);
      if (!isList(nextNode)) return false;

      // Next node is a list - merge the paragraph content, delete the list
      const nextListItem = nextNode.firstChild;
      if (!nextListItem || nextListItem.type.name !== 'listItem') return false;

      const nextPara = nextListItem.firstChild;
      if (!nextPara || nextPara.type.name !== 'paragraph') return false;

      const nextListStartPos = findNodePosition(doc, nextNode);
      if (nextListStartPos == null) return false;

      const targetInlineContent = Fragment.from(nextPara.content);
      const tr = state.tr;
      tr.setMeta('updateListSync', true);

      // Delete the entire next list
      tr.delete(nextListStartPos, nextListStartPos + nextNode.nodeSize);

      // Insert the content at current position
      const insertPos = tr.mapping.map($from.pos);
      tr.insert(insertPos, targetInlineContent);

      tr.setSelection(TextSelection.near(tr.doc.resolve(insertPos), 1));

      dispatch(tr);
      return true;
    } else {
      // We're in a regular paragraph - handle paragraph-to-list merging
      const parentDepth = $from.depth - 1;
      if (parentDepth < 0) return false;
      const container = $from.node(parentDepth);
      const idx = $from.index(parentDepth);

      if (idx >= container.childCount - 1) return false;

      const afterNode = container.child(idx + 1);
      if (!afterNode || !isList(afterNode)) return false;

      const listItem = afterNode.firstChild;
      if (!listItem || listItem.type.name !== 'listItem') return false;

      const targetPara = listItem.firstChild;
      if (!targetPara || targetPara.type.name !== 'paragraph') return false;

      const listStartPos = findNodePosition(doc, afterNode);
      if (listStartPos == null) return false;

      const targetInlineContent = Fragment.from(targetPara.content);
      const tr = state.tr;
      tr.setMeta('updateListSync', true);

      tr.delete(listStartPos, listStartPos + afterNode.nodeSize);

      const insertPos = tr.mapping.map($from.pos);
      tr.insert(insertPos, targetInlineContent);

      tr.setSelection(TextSelection.near(tr.doc.resolve(insertPos), 1));

      dispatch(tr);
      return true;
    }
  };
