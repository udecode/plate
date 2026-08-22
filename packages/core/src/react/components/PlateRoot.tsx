import { Plite } from '@platejs/plite-react';
import { failInvariant } from '@platejs/plite/internal';
import React from 'react';

import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { getPlateEditorInstanceKey } from '../internal/getPlateEditorInstanceKey';
import { usePlateModelRevision } from '../internal/usePlateModelRevision';
import { useEditor } from '../stores/plate';

/**
 * Plite runtime with Plate plugins.
 *
 * - Change callbacks
 * - `render.abovePlite`
 */
export function PlateRoot({
  id,
  children,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  const editor = useEditor({ id });

  usePlateModelRevision(editor);

  let abovePlite = (
    <Plite key={getPlateEditorInstanceKey(editor)} editor={editor}>
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
