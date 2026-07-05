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
    <Slate
      key={slateProps.key}
      editor={slateProps.editor}
      onChange={slateProps.onChange}
      onSelectionChange={slateProps.onSelectionChange}
      onValueChange={slateProps.onValueChange}
    >
      {children}
    </Slate>
  );

  editor.runtime.pluginCache.render.abovePlite.forEach((key) => {
    const plugin = editor.getPlugin({ key });
    const AboveSlate = plugin.render.abovePlite!;

    aboveSlate = <AboveSlate>{aboveSlate}</AboveSlate>;
  });

  return aboveSlate;
}
