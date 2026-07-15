import React from 'react';

import { Plite } from '@platejs/plite-react';

import { usePlateRootProps } from '../hooks';
import { useEditorRef } from '../stores/plate';

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

  const editor = useEditorRef(id);

  let abovePlite = (
    <Plite
      key={rootProps.key}
      editor={rootProps.editor}
      onChange={rootProps.onChange}
      onSelectionChange={rootProps.onSelectionChange}
      onValueChange={rootProps.onValueChange}
    >
      {children}
    </Plite>
  );

  editor.runtime.pluginCache.render.abovePlite.forEach((key) => {
    const plugin = editor.getPlugin({ key });
    const AbovePlite = plugin.render.abovePlite!;

    abovePlite = <AbovePlite>{abovePlite}</AbovePlite>;
  });

  return abovePlite;
}
