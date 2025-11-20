import { type TNode, PathApi } from '@platejs/slate';
import { useMemoizedSelector } from '@udecode/react-utils';

import { useEditorRef } from '../stores';

/**
 * Returns the path of a node every time the node changes. Note, however, that
 * if another node is updated in a way that affects this node's path, this hook
 * will not return the new path.
 */
export const useNodePath = (node: TNode) => {
  const editor = useEditorRef();

  return useMemoizedSelector(
    () => editor.api.findPath(node),
    [editor, node],
    (a, b) => !!a && !!b && PathApi.equals(a, b)
  );
};
