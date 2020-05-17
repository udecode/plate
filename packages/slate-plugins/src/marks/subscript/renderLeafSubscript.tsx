import React from 'react';
import { RenderLeafProps } from 'slate-react';
import { MARK_SUBSCRIPT } from './types';

export const renderLeafSubscript = ({
  typeSubscript = MARK_SUBSCRIPT,
} = {}) => ({ children, leaf }: RenderLeafProps) => {
  if (leaf[typeSubscript]) return <sub>{children}</sub>;

  return children;
};
