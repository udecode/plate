import React from 'react';

import type { RenderNodeWrapperFunction } from '@platejs/core/react';

import { useIsVisible } from './useToggle';

export const renderToggleAboveNodes = () => ToggleAboveNodes;

const ToggleAboveNodes: RenderNodeWrapperFunction = ({ children, element }) => {
  const isVisible = useIsVisible(
    typeof element.id === 'string' ? element.id : ''
  );

  if (isVisible) return children;

  return <div style={hiddenStyle}>{children}</div>;
};

const hiddenStyle: React.CSSProperties = {
  height: 0,
  margin: 0,
  overflow: 'hidden',
  visibility: 'hidden',
};
