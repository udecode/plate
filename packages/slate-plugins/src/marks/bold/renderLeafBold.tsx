import React from 'react';
import { RenderLeafProps } from 'slate-react';
import { MARK_BOLD } from './types';

export const renderLeafBold = ({ typeBold = MARK_BOLD } = {}) => ({
  children,
  leaf,
}: RenderLeafProps) => {
  if (leaf[typeBold]) return <strong>{children}</strong>;

  return children;
};
