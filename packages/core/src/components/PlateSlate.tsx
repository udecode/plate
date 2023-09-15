import React, { ReactNode } from 'react';
import { Slate } from 'slate-react';

import { useSlateProps } from '../hooks';
import { PlateId, useEditorRef } from '../stores';

/**
 * Slate with plugins.
 *
 * - onChange prop
 * - renderAboveSlate
 */
export function PlateSlate({
  id,
  children,
}: {
  id?: PlateId;
  children: ReactNode;
}) {
  const slateProps = useSlateProps({ id });

  const { plugins } = useEditorRef(id);

  let aboveSlate: React.ReactElement | null = (
    <Slate {...(slateProps as any)}>{children}</Slate>
  );

  plugins?.forEach((plugin) => {
    const { renderAboveSlate } = plugin;

    if (renderAboveSlate)
      aboveSlate = renderAboveSlate({
        children: aboveSlate,
      }) as any;
  });

  return aboveSlate;
}
