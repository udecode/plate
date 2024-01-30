import React from 'react';

import { ToggleControllerProvider } from './store';
import { ToggleStyle } from './ToggleStyle';

export const RenderAboveEditableToggle = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ToggleControllerProvider>
      <ToggleStyle />
      {children}
    </ToggleControllerProvider>
  );
};
