import React from 'react';

import { type PlateElementProps, useEditor } from '@platejs/core/react';

import type { BaseTogglePlugin } from '../lib/BaseTogglePlugin';
import { useIsVisible } from './useToggle';

export function ToggleVisibility({
  children,
  element,
}: PlateElementProps<typeof BaseTogglePlugin>) {
  const editor = useEditor();
  const isVisible = useIsVisible(editor.key(element));

  if (isVisible) return children;

  return (
    <div
      style={{
        height: 0,
        margin: 0,
        overflow: 'hidden',
        visibility: 'hidden',
      }}
    >
      {children}
    </div>
  );
}
