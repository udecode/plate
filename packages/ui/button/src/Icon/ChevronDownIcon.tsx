import React from 'react';
import { StyledIcon, StyledIconProps } from './StyledIcon';

export const ChevronDownIcon = (props: StyledIconProps) => (
  <StyledIcon
    viewBox="0 0 24 24"
    focusable="false"
    aria-hidden="true"
    className="pointer-events-none inline h-full max-h-full max-w-full select-none overflow-hidden text-center align-middle"
    {...props}
  >
    <path
      fill="currentColor"
      d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
    />
  </StyledIcon>
);
