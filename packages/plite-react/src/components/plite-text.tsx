import React, { type ReactNode, type Ref } from 'react';
import type { Path, NodeKey } from '@platejs/plite';

import { recordPliteReactRender } from '../render-profiler';
import { getPliteTextShellAttributes } from '../shell-runtime';

/**
 * Render a Plite text DOM shell bound to a text runtime.
 *
 * The shell carries path/runtime metadata and DOM-sync attributes used by
 * selection, mutation, and projected DOM coverage.
 */
export const PliteText = ({
  domSync = false,
  domSyncReason,
  projectedDomSync = false,
  children,
  path,
  ref,
  nodeKey,
}: {
  children: ReactNode;
  domSync?: boolean;
  domSyncReason?: string | null;
  path?: Path;
  projectedDomSync?: boolean;
  ref?: Ref<HTMLSpanElement>;
  nodeKey?: NodeKey | null;
}) => {
  recordPliteReactRender({ kind: 'text' });

  return (
    <span
      data-plite-path={path ? path.join(',') : undefined}
      data-plite-projected-dom-sync={projectedDomSync ? true : undefined}
      data-plite-node-key={nodeKey ?? undefined}
      {...getPliteTextShellAttributes({ domSync, domSyncReason })}
      ref={ref}
    >
      {children}
    </span>
  );
};
