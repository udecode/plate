import React from 'react';
import { RenderLeafProps } from 'slate-react';
import { MARK_SUPERSCRIPT } from './types';

export const renderLeafSuperscript = () => ({
  children,
  leaf,
}: RenderLeafProps) => {
  if (leaf[MARK_SUPERSCRIPT]) return <sup>{children}</sup>;

  return children;
};
