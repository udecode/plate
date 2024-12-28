import type { TNode } from '@udecode/slate';

import { useMemoizedSelector } from '@udecode/react-utils';
import { Path } from 'slate';

import { useEditorRef } from '../stores';

export const useNodePath = (node: TNode) => {
  const editor = useEditorRef();

  return useMemoizedSelector(
    () => {
      return editor.findPath(node);
    },
    [editor, node],
    (a, b) => {
      return !!a && !!b && Path.equals(a, b);
    }
  );
};
