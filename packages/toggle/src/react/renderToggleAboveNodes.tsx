import React from 'react';

import type { NodeWrapperComponentReturnType } from '@udecode/plate-common/react';

import { useIsVisible } from './toggle-controller-store';

export const renderToggleAboveNodes = (): NodeWrapperComponentReturnType =>
  ToggleAboveNodes;

const ToggleAboveNodes: NodeWrapperComponentReturnType = ({
  children,
  element,
}) => {
  const isVisible = useIsVisible(element.id as string);

  if (isVisible) return children;

  return <div style={hiddenStyle}>{children}</div>;
};

const hiddenStyle: React.CSSProperties = {
  height: 0,
  margin: 0,
  overflow: 'hidden',
  visibility: 'hidden',
};
