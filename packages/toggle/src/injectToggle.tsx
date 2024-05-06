import React from 'react';

import type { InjectComponentReturnType } from '@udecode/plate-common/server';

import { useIsVisible } from './toggle-controller-store';

export const injectToggle = (): InjectComponentReturnType => WithToggle;

const WithToggle: InjectComponentReturnType = ({ children, element }) => {
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
