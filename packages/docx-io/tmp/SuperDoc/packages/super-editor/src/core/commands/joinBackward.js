import { joinBackward as originalJoinBackward } from 'prosemirror-commands';

/**
 * Join two nodes backward.
 *
 * If the selection is empty and at the start of a textblock, try to
 * reduce the distance between that block and the one before it—if
 * there's a block directly before it that can be joined, join them.
 * If not, try to move the selected block closer to the next one in
 * the document structure by lifting it out of its parent or moving it
 * into a parent of the previous block. Will use the view for accurate
 * (bidi-aware) start-of-textblock detection if given.
 *
 * https://prosemirror.net/docs/ref/#commands.joinBackward
 */
//prettier-ignore
export const joinBackward = () => ({ state, dispatch }) => {
  const { selection, doc } = state;
  const { $from } = selection;

  if (
    !$from.parent.isTextblock || 
    $from.parentOffset > 0
  ) {
    // Normal case, let original handle it
    return originalJoinBackward(state, dispatch);
  }

  const beforePos = $from.before();
  const nodeBefore = doc.resolve(beforePos).nodeBefore;
  const nodeAfter = doc.resolve(beforePos).nodeAfter;

  // Dont join lists
  const isList = (node) => node?.type.name === 'orderedList' || node?.type.name === 'bulletList';
  if (isList(nodeBefore) || isList(nodeAfter)) {
    return false;
  }

  return originalJoinBackward(state, dispatch);
};
