import React from 'react';
import { StyledIcon, StyledIconProps } from './StyledIcon';

export const DeleteIcon = (props: StyledIconProps) => (
  <StyledIcon viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fill="none" d="M0 0h24v24H0z" />
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </StyledIcon>
);
