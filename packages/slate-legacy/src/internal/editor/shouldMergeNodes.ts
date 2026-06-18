import { ElementApi, type NodeEntry, TextApi } from '../../interfaces';
import type { Editor } from '../../interfaces/editor/editor-type';

export const shouldMergeNodes = (
  editor: Editor,
  prevNodeEntry: NodeEntry,
  _: NodeEntry
) => {
  const [prevNode, prevPath] = prevNodeEntry;

  // If the target node that we're merging with is empty, remove it instead
  // of merging the two. This is a common rich text editor behavior to
  // prevent losing formatting when deleting entire nodes when you have a
  // hanging selection.
  // if prevNode is first child in parent,don't remove it.

  if (
    (ElementApi.isElement(prevNode) && editor.api.isEmpty(prevNode)) ||
    (TextApi.isText(prevNode) && prevNode.text === '' && prevPath.at(-1) !== 0)
  ) {
    editor.tf.removeNodes({ at: prevPath });
    return false;
  }

  return true;
};
