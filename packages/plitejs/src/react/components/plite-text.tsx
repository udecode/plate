import React, { type ReactNode, type Ref } from 'react';

import type { Path, NodeKey } from '../..';
import { usePliteNodeKeyDOMValue } from '../hooks/use-plite-node-ref';
import { recordPliteReactRender } from '../render-profiler';
import { getPliteTextShellAttributes } from '../shell-runtime';

/**
 * Render a Plite text DOM shell bound to a text runtime.
 *
 * The shell carries path/runtime metadata and native DOM-sync attributes used
 * by selection and mutation handling.
 */
export const PliteText = ({
  domSync = false,
  domSyncReason,
  children,
  path,
  ref,
  nodeKey,
}: {
  children: ReactNode;
  domSync?: boolean;
  domSyncReason?: string | null;
  path?: Path;
  ref?: Ref<HTMLSpanElement>;
  nodeKey?: NodeKey | null;
}) => {
  const nodeKeyDOMValue = usePliteNodeKeyDOMValue(nodeKey ?? null);

  recordPliteReactRender({ kind: 'text' });

  return (
    <span
      data-plite-path={path ? path.join(',') : undefined}
      data-plite-node-key={nodeKeyDOMValue}
      {...getPliteTextShellAttributes({ domSync, domSyncReason })}
      ref={ref}
    >
      {children}
    </span>
  );
};
