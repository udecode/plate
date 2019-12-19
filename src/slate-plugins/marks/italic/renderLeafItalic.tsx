import React from 'react';
import { RenderLeafProps } from 'slate-react';
import { MARK_ITALIC } from './types';

export const renderLeafItalic = () => ({ children, leaf }: RenderLeafProps) => {
  if (leaf[MARK_ITALIC]) return <em>{children}</em>;

  return children;
};
