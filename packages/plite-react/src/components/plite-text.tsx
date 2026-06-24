import type { ReactNode, Ref } from 'react';
import type { Path, RuntimeId } from '@platejs/plite';

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
  runtimeId,
}: {
  children: ReactNode;
  domSync?: boolean;
  domSyncReason?: string | null;
  path?: Path;
  projectedDomSync?: boolean;
  ref?: Ref<HTMLSpanElement>;
  runtimeId?: RuntimeId | null;
}) => {
  recordPliteReactRender({ kind: 'text' });

  return (
    <span
      data-plite-path={path ? path.join(',') : undefined}
      data-plite-projected-dom-sync={projectedDomSync ? true : undefined}
      data-plite-runtime-id={runtimeId ?? undefined}
      {...getPliteTextShellAttributes({ domSync, domSyncReason })}
      ref={ref}
    >
      {children}
    </span>
  );
};
