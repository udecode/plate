import * as React from 'react';
import {
  MARK_UNDERLINE,
  UnderlineRenderLeafOptions,
  UnderlineRenderLeafProps,
} from './types';

export const renderLeafUnderline = ({
  typeUnderline = MARK_UNDERLINE,
}: UnderlineRenderLeafOptions = {}) => ({
  children,
  leaf,
}: UnderlineRenderLeafProps) => {
  if (leaf[typeUnderline] && !!leaf.text) return <u>{children}</u>;

  return children;
};
