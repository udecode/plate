import { NodeApi } from '../interfaces';
import { isEmpty as editorIsEmpty } from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { resolveShouldMergeNodesRemovePrevNode } from '../core/editor-read-execution';

export const shouldMergeNodesRemovePrevNode: EditorStaticApi['shouldMergeNodesRemovePrevNode'] =
  (editor, previous, current) => {
    return resolveShouldMergeNodesRemovePrevNode(
      editor,
      previous,
      current,
      () => {
        const [prevNode, prevPath] = previous;

        // If the target node that we're merging with is empty, remove it
        // instead of merging the two.
        return (
          (NodeApi.isElement(prevNode) && editorIsEmpty(editor, prevNode)) ||
          (NodeApi.isText(prevNode) &&
            prevNode.text === '' &&
            prevPath.at(-1)! !== 0)
        );
      }
    );
  };
