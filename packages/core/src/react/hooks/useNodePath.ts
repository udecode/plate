import { type TNode, PathApi } from '@platejs/slate';
import { useMemoizedSelector } from '@udecode/react-utils';

import { useEditorRef } from '../stores';

export const useNodePath = (node: TNode) => {
  const editor = useEditorRef();

  return useMemoizedSelector(
    () => {
      return editor.api.findPath(node);
    },
    [editor, node],
    (a, b) => {
      return !!a && !!b && PathApi.equals(a, b);
    }
  );
};
