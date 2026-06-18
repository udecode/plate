import type { ReactNode } from 'react';

import { recordSlateReactRender } from '../render-profiler';
import { getSlateLeafShellAttributes } from '../shell-runtime';

/**
 * Render a Slate leaf shell for decorated text content.
 *
 * The shell carries Slate leaf attributes and render profiling metadata while
 * leaving actual text children to the caller.
 */
export const SlateLeaf = ({
  attributes,
  children,
}: {
  attributes?: {
    'data-slate-leaf': true;
    'data-slate-leaf-end'?: number;
    'data-slate-leaf-start'?: number;
  };
  children: ReactNode;
}) => {
  recordSlateReactRender({ kind: 'leaf' });

  return (
    <span {...getSlateLeafShellAttributes()} {...attributes}>
      {children}
    </span>
  );
};
