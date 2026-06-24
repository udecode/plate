import { NodeApi } from '../interfaces';
import { isEmpty as editorIsEmpty } from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';

export const shouldMergeNodesRemovePrevNode: EditorStaticApi['shouldMergeNodesRemovePrevNode'] =
  (editor, [prevNode, prevPath], [_curNode, _curNodePath]) => {
    // If the target node that we're merging with is empty, remove it instead
    // of merging the two. This is a common rich text editor behavior to
    // prevent losing formatting when deleting entire nodes when you have a
    // hanging selection.
    // if prevNode is first child in parent,don't remove it.

    return (
      (NodeApi.isElement(prevNode) && editorIsEmpty(editor, prevNode)) ||
      (NodeApi.isText(prevNode) &&
        prevNode.text === '' &&
        prevPath.at(-1)! !== 0)
    );
  };
