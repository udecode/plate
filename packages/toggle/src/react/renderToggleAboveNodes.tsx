import React from 'react';

import type {
  RenderNodeWrapper,
  RenderNodeWrapperFunction,
} from '@udecode/plate/react';

import { useIsVisible } from './toggleIndexAtom';

export const renderToggleAboveNodes: RenderNodeWrapper = () => ToggleAboveNodes;

const ToggleAboveNodes: RenderNodeWrapperFunction = ({ children, element }) => {
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
