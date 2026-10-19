import React, { type ReactNode } from 'react';

import { recordPliteReactRender } from '../render-profiler';
import { getPliteLeafShellAttributes } from '../shell-runtime';

/**
 * Render a Plite leaf shell for decorated text content.
 *
 * The shell carries Plite leaf attributes and render profiling metadata while
 * leaving actual text children to the caller.
 */
export const EditorLeaf = ({
  attributes,
  children,
}: {
  attributes?: {
    'data-editor-leaf': true;
    'data-editor-leaf-end'?: number;
    'data-editor-leaf-start'?: number;
  };
  children: ReactNode;
}) => {
  recordPliteReactRender({ kind: 'leaf' });

  return (
    <span {...getPliteLeafShellAttributes()} {...attributes}>
      {children}
    </span>
  );
};
