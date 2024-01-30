import React from 'react';
import { InjectComponentReturnType } from '@udecode/plate-common';

import { useIsVisible } from './store';

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
};
