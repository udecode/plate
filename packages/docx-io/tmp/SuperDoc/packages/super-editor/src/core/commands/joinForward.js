import { joinForward as originalJoinForward } from 'prosemirror-commands';

/**
 * Join two nodes forward.
 *
 * If the selection is empty and the cursor is at the end of a
 * textblock, try to reduce or remove the boundary between that block
 * and the one after it, either by joining them or by moving the other
 * block closer to this one in the tree structure. Will use the view
 * for accurate start-of-textblock detection if given.
 *
 * https://prosemirror.net/docs/ref/#commands.joinForward
 */
//prettier-ignore
export const joinForward = () => ({ state, dispatch }) => {
  const { selection, doc } = state;
  const { $from } = selection;

  if (
    !$from.parent.isTextblock || 
    $from.parentOffset > 0
  ) {
    // Normal case, let original handle it
    return originalJoinForward(state, dispatch);
  }

  const beforePos = $from.before();
  const nodeBefore = doc.resolve(beforePos).nodeBefore;
  const nodeAfter = doc.resolve(beforePos).nodeAfter;

  // Dont join lists
  const isList = (node) => node?.type.name === 'orderedList' || node?.type.name === 'bulletList';
  if (isList(nodeBefore) || isList(nodeAfter)) {
    return false;
  }

  return originalJoinForward(state, dispatch);
};
