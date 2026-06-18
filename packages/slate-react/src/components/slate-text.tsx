import type { ReactNode, Ref } from 'react';
import type { Path, RuntimeId } from '@platejs/slate';

import { recordSlateReactRender } from '../render-profiler';
import { getSlateTextShellAttributes } from '../shell-runtime';

/**
 * Render a Slate text DOM shell bound to a text runtime.
 *
 * The shell carries path/runtime metadata and DOM-sync attributes used by
 * selection, mutation, and projected DOM coverage.
 */
export const SlateText = ({
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
  recordSlateReactRender({ kind: 'text' });

  return (
    <span
      data-slate-path={path ? path.join(',') : undefined}
      data-slate-projected-dom-sync={projectedDomSync ? true : undefined}
      data-slate-runtime-id={runtimeId ?? undefined}
      {...getSlateTextShellAttributes({ domSync, domSyncReason })}
      ref={ref}
    >
      {children}
    </span>
  );
};
