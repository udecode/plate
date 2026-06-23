import React from 'react';
import { Plite as PliteRuntime } from '@platejs/plite-react';

import { usePliteProps } from '../hooks';
import { useEditorRef } from '../stores/plate';

/**
 * Plite with plugins.
 *
 * - OnChange prop
 * - RenderAboveSlate
 */
export function Plite({
  id,
  children,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  const pliteProps = usePliteProps({ id });

  const editor = useEditorRef(id);

  let abovePlite: React.ReactElement<any> | null = (
    <PliteRuntime
      key={pliteProps.key}
      editor={pliteProps.editor}
      onChange={pliteProps.onChange}
      onSelectionChange={pliteProps.onSelectionChange}
      onValueChange={pliteProps.onValueChange}
    >
      {children}
    </PliteRuntime>
  );

  editor.meta.pluginCache.render.abovePlite.forEach((key) => {
    const plugin = editor.getPlugin({ key });
    const AboveSlate = plugin.render.abovePlite!;

    abovePlite = <AboveSlate>{abovePlite}</AboveSlate>;
  });

  return abovePlite;
}
