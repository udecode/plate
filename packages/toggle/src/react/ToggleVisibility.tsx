import React from 'react';

import type { PlateElementProps } from '@platejs/core/react';

import { useIsVisible } from './useToggle';

export function ToggleVisibility({ children, element }: PlateElementProps) {
  const isVisible = useIsVisible(
    typeof element.id === 'string' ? element.id : ''
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
