import React from 'react';

import { Slate } from 'slate-react';

import { useSlateProps } from '../hooks';
import { useEditorRef } from '../stores/plate';

/**
 * Slate with plugins.
 *
 * - OnChange prop
 * - RenderAboveSlate
 */
export function PlateSlate({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  const slateProps = useSlateProps({ id });

  const editor = useEditorRef(id);

  let aboveSlate: React.ReactElement | null = (
    <Slate {...(slateProps as any)}>{children}</Slate>
  );

  editor.pluginList?.forEach((plugin) => {
    const { renderAboveSlate: RenderAboveSlate } = plugin;

    if (RenderAboveSlate)
      aboveSlate = <RenderAboveSlate>{aboveSlate}</RenderAboveSlate>;
  });

  return aboveSlate;
}
