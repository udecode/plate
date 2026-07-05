import React from 'react';

import type { Descendant } from '@platejs/plite';

import { useEditorRef } from '../stores';

/**
 * Returns the path of a node every time the node changes. Note, however, that
 * if another node is updated in a way that affects this node's path, this hook
 * will not return the new path.
 */
export const useNodePath = (node: Descendant) => {
  const editor = useEditorRef();

  return React.useMemo(() => editor.read.nodes.pathOf(node), [editor, node]);
};
