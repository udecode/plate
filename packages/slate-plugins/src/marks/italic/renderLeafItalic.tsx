import React from 'react';
import { RenderLeafProps } from 'slate-react';
import { MARK_ITALIC } from './types';

export const renderLeafItalic = ({ typeItalic = MARK_ITALIC }) => ({
  children,
  leaf,
}: RenderLeafProps) => {
  if (leaf[typeItalic]) return <em>{children}</em>;

  return children;
};
