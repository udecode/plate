import React from 'react';
import { RenderLeafProps } from 'slate-react';
import { MARK_BOLD } from './types';

export const renderLeafBold = () => ({ children, leaf }: RenderLeafProps) => {
  if (leaf[MARK_BOLD]) return <strong>{children}</strong>;

  return children;
};
