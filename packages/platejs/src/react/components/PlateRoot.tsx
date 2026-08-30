import { useAtomStoreValue } from 'jotai-x';
import React from 'react';

import type { RootKey } from '../../facade';
import { failInvariant } from '../../internal/failInvariant';
import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { getPlateEditorInstanceKey } from '../internal/getPlateEditorInstanceKey';
import { PlateRuntimeContext } from '../internal/PlateRuntimeContext';
import { Plite } from '../internal/plite-components';
import { usePlateModelRevision } from '../internal/usePlateModelRevision';
import { useEditor, usePlateStore } from '../stores/plate';

/**
 * Plite runtime with Plate plugins.
 *
 * - Change callbacks
 * - `render.abovePlite`
 */
export function PlateRoot({
  id,
  children,
  root,
}: {
  children: React.ReactNode;
  id?: string;
  root?: RootKey;
}) {
  const editor = useEditor({ id });
  const hasRuntime = React.useContext(PlateRuntimeContext);
  const store = usePlateStore(id);
  const annotationStore = useAtomStoreValue(store, 'annotationStore');
  const decorationSources = useAtomStoreValue(store, 'decorationSources');

  usePlateModelRevision(editor);

  let abovePlite =
    hasRuntime && root === undefined ? (
      children
    ) : (
      <Plite
        key={`${getPlateEditorInstanceKey(editor)}:${root ?? 'main'}`}
        annotationStore={annotationStore}
        decorationSources={decorationSources}
        {...(hasRuntime ? { root } : { editor })}
      >
        {children}
      </Plite>
    );

  getPlateRuntime(editor).pluginCache.render.abovePlite.forEach((name) => {
    const plugin =
      getCompiledPlatePlugin(editor, name) ??
      failInvariant('Expected value to be defined');
    const AbovePlite =
      plugin.render.abovePlite ?? failInvariant('Expected value to be defined');

    abovePlite = <AbovePlite>{abovePlite}</AbovePlite>;
  });

  return abovePlite;
}
