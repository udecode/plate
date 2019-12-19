import React from 'react';
import { RenderLeafProps } from 'slate-react';
import { MARK_CODE } from './types';

export const renderLeafInlineCode = () => ({
  children,
  leaf,
}: RenderLeafProps) => {
  if (leaf[MARK_CODE]) return <code>{children}</code>;

  return children;
};
