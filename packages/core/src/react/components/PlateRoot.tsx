import React from 'react';

import { Plite } from '@platejs/plite-react';

import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { usePlateRootProps } from '../hooks';
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
  const rootProps = usePlateRootProps({ id });

  const editor = useEditor({ id });

  usePlateModelRevision(editor);

  let abovePlite = (
    <Plite key={rootProps.key} editor={rootProps.editor}>
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
