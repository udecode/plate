import { useMemoizedSelector } from '@udecode/react-utils';
import { type TNode, PathApi } from '@udecode/slate';

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
