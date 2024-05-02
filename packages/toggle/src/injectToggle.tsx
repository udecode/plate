import React from 'react';
import { InjectComponentReturnType } from '@udecode/plate-common/server';

import { useIsVisible } from './toggle-controller-store';

export const injectToggle = (): InjectComponentReturnType => WithToggle;

const WithToggle: InjectComponentReturnType = ({ element, children }) => {
  const isVisible = useIsVisible(element.id as string);

  if (isVisible) return children;

  return <div style={hiddenStyle}>{children}</div>;
};

const hiddenStyle: React.CSSProperties = {
  visibility: 'hidden',
  height: 0,
  margin: 0,
  overflow: 'hidden',
};
