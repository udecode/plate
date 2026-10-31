import React, { type ReactNode, type Ref, useContext } from 'react';

import type { Path, NodeKey } from '../..';
import { usePliteNodeKeyDOMValue } from '../hooks/use-plite-node-ref';
import { recordPliteReactRender } from '../render-profiler';
import { getPliteTextShellAttributes } from '../shell-runtime';
import { TextRenderScopeContext } from './editable-text-pieces';

/**
 * Render a Plite text DOM shell bound to a text runtime.
 *
 * The shell carries path/runtime metadata and native DOM-sync attributes used
 * by selection and mutation handling. Inside a `renderText` call for one piece
 * of a paged text it renders a plain span, because the editor already renders
 * that text's shell around its pieces.
 */
export const EditorText = ({
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
  const scope = useContext(TextRenderScopeContext);

  if (scope === 'piece') {
    return <span>{children}</span>;
  }

  recordPliteReactRender({ kind: 'text' });

  return (
    <span
      data-editor-path={path ? path.join(',') : undefined}
      data-editor-node-key={nodeKeyDOMValue}
      {...getPliteTextShellAttributes({ domSync, domSyncReason })}
      ref={ref}
    >
      {children}
    </span>
  );
};
