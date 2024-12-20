import React from 'react';

import type { TNode } from '@udecode/slate';

import { findPath } from '@udecode/slate-react';

import { useEditorRef } from '../stores';

export const useNodePath = (node: TNode) => {
  const editor = useEditorRef();

  return React.useMemo(() => findPath(editor, node), [editor, node]);
};
