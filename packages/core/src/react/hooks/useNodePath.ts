import React from 'react';

import type { TNode } from '@udecode/slate';

import { useEditorRef } from '../stores';

export const useNodePath = (node: TNode) => {
  const editor = useEditorRef();

  return React.useMemo(() => editor.findPath(node), [editor, node]);
};
