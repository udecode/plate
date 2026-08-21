import {
  type PlateElementProps,
  useEditor,
  usePluginStore,
} from '@platejs/core/react';
import React from 'react';

import type { BaseTogglePlugin } from '../lib/BaseTogglePlugin';
import { TogglePlugin } from './TogglePlugin';

export function ToggleVisibility({
  children,
  element,
}: PlateElementProps<typeof BaseTogglePlugin>) {
  const editor = useEditor();
  const isVisible = !usePluginStore(
    TogglePlugin,
    'isClosed',
    editor.key(element)
  );

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
