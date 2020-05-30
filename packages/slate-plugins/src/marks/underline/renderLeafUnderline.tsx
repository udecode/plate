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
  if (leaf[typeUnderline]) return <u>{children}</u>;

  return children;
};
