import type { ReactNode } from 'react';

import { recordPliteReactRender } from '../render-profiler';
import { getPliteLeafShellAttributes } from '../shell-runtime';

/**
 * Render a Plite leaf shell for decorated text content.
 *
 * The shell carries Plite leaf attributes and render profiling metadata while
 * leaving actual text children to the caller.
 */
export const PliteLeaf = ({
  attributes,
  children,
}: {
  attributes?: {
    'data-plite-leaf': true;
    'data-plite-leaf-end'?: number;
    'data-plite-leaf-start'?: number;
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
