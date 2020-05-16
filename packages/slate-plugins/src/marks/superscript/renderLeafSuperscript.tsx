import React from 'react';
import { RenderLeafProps } from 'slate-react';
import { MARK_SUPERSCRIPT } from './types';

export const renderLeafSuperscript = ({
  typeSuperscript = MARK_SUPERSCRIPT,
}) => ({ children, leaf }: RenderLeafProps) => {
  if (leaf[typeSuperscript]) return <sup>{children}</sup>;

  return children;
};
