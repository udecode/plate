import React from 'react';

import { Plite } from '@platejs/plite-react';

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
    const plugin = getCompiledPlatePlugin(editor, name)!;
    const AbovePlite = plugin.render.abovePlite!;

    abovePlite = <AbovePlite>{abovePlite}</AbovePlite>;
  });

  return abovePlite;
}
