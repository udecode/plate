import React from 'react';

import type { RootKey } from '../../facade';
import { failInvariant } from '../../internal/failInvariant';
import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { getPlateDecorationSources } from '../../internal/plugin/getPlateDecorationSources';
import { getPlateEditorInstanceKey } from '../internal/getPlateEditorInstanceKey';
import { PlateMountedView, usePlateModel } from '../internal/plate-context';
import { Plite } from '../internal/plite-components';
import { usePlateModelRevision } from '../internal/usePlateModelRevision';

/**
 * Plite runtime with Plate plugins.
 *
 * - Change callbacks
 * - `slots.wrapRoot`
 */
export function PlateRoot({
  children,
  editableRef: providedEditableRef,
  readOnly,
  root,
}: {
  children: React.ReactNode;
  editableRef?: React.RefObject<HTMLDivElement | null>;
  readOnly?: boolean;
  root?: RootKey;
}) {
  const emptyEditableRef = React.useRef<HTMLDivElement | null>(null);
  const editableRef = providedEditableRef ?? emptyEditableRef;
  const { editor, readOnly: modelReadOnly } = usePlateModel();
  const modelRevision = usePlateModelRevision(editor);
  const decorations = React.useMemo(() => {
    void modelRevision;

    return getPlateDecorationSources(editor);
  }, [editor, modelRevision]);

  let rootContent = children;

  getPlateRuntime(editor).pluginCache.slots.wrapRoot.forEach((name) => {
    const plugin =
      getCompiledPlatePlugin(editor, name) ??
      failInvariant('Expected value to be defined');
    const WrapRoot =
      plugin.slots.wrapRoot ?? failInvariant('Expected value to be defined');

    rootContent = <WrapRoot editableRef={editableRef}>{rootContent}</WrapRoot>;
  });

  return (
    <Plite
      key={`${getPlateEditorInstanceKey(editor)}:${root ?? 'main'}`}
      decorations={decorations}
      readOnly={readOnly ?? modelReadOnly}
      root={root}
    >
      <PlateMountedView editableRef={editableRef}>
        {rootContent}
      </PlateMountedView>
    </Plite>
  );
}
