import React from 'react';
import { RenderLeafProps } from 'slate-react';
import { MARK_UNDERLINE } from './types';

export const renderLeafUnderline = ({
  typeUnderline = MARK_UNDERLINE,
} = {}) => ({ children, leaf }: RenderLeafProps) => {
  if (leaf[typeUnderline]) return <u>{children}</u>;

  return children;
};
