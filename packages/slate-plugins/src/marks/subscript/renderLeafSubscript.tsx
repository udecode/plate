import React from 'react';
import { RenderLeafProps } from 'slate-react';
import { MARK_SUBSCRIPT } from './types';

export const renderLeafSubscript = () => ({
  children,
  leaf,
}: RenderLeafProps) => {
  if (leaf[MARK_SUBSCRIPT]) return <sub>{children}</sub>;

  return children;
};
