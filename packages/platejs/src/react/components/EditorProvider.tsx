import React from 'react';

import type { Editor } from '../editor/Editor';
import { getPlateTarget, PlateTargetProvider } from '../internal/plate-context';

/** Provide an existing editor to controls without creating a model or mounted view. */
export function EditorProvider({
  children,
  editor,
}: {
  children: React.ReactNode;
  editor: Editor | null;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const editableRef = React.useRef<HTMLDivElement>(null);
  const target = React.useMemo(
    () =>
      editor
        ? (getPlateTarget(editor) ?? { editor, containerRef, editableRef })
        : null,
    [editor]
  );
  return <PlateTargetProvider target={target}>{children}</PlateTargetProvider>;
}
