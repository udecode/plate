import React from 'react';
import { RenderLeafProps } from 'slate-react';
import { MARK_UNDERLINE } from './types';

export const renderLeafUnderline = () => ({
  children,
  leaf,
}: RenderLeafProps) => {
  if (leaf[MARK_UNDERLINE]) return <u>{children}</u>;

  return children;
};
