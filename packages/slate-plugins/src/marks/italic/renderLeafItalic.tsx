import * as React from 'react';
import {
  ItalicRenderLeafOptions,
  ItalicRenderLeafProps,
  MARK_ITALIC,
} from './types';

export const renderLeafItalic = ({
  typeItalic = MARK_ITALIC,
}: ItalicRenderLeafOptions = {}) => ({
  children,
  leaf,
}: ItalicRenderLeafProps) => {
  if (leaf[typeItalic]) return <em>{children}</em>;

  return children;
};
