import React from 'react';

import { useSlateProps } from '../hooks';
import { Slate } from '../slate-react';
import { useEditorRef } from '../stores/plate';

/**
 * Slate with plugins.
 *
 * - OnChange prop
 * - RenderAboveSlate
 */
export function PlateSlate({
  id,
  children,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  const slateProps = useSlateProps({ id });

  const editor = useEditorRef(id);

  let aboveSlate: React.ReactElement<any> | null = (
    <Slate {...(slateProps as any)}>{children}</Slate>
  );

  editor.meta.pluginCache.render.aboveSlate.forEach((key) => {
    const plugin = editor.plugins[key];
    const AboveSlate = plugin.render.aboveSlate!;

    aboveSlate = <AboveSlate>{aboveSlate}</AboveSlate>;
  });

  return aboveSlate;
}
