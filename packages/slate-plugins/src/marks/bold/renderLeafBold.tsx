import * as React from 'react';
import { BoldRenderLeafOptions, BoldRenderLeafProps, MARK_BOLD } from './types';

export const renderLeafBold = ({
  typeBold = MARK_BOLD,
}: BoldRenderLeafOptions = {}) => ({ children, leaf }: BoldRenderLeafProps) => {
  if (leaf[typeBold]) return <strong>{children}</strong>;

  return children;
};
