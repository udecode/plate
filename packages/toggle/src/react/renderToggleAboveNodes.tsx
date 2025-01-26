import React from 'react';

import type {
  NodeWrapperFunction,
  NodeWrapperFunctionCreator,
} from '@udecode/plate/react';

import { useIsVisible } from './toggleIndexAtom';

export const renderToggleAboveNodes: NodeWrapperFunctionCreator = () =>
  ToggleAboveNodes;

const ToggleAboveNodes: NodeWrapperFunction = ({ children, element }) => {
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
