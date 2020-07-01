import * as React from 'react';
import {
  MARK_SUPERSCRIPT,
  SuperscriptRenderLeafOptions,
  SuperscriptRenderLeafProps,
} from './types';

export const renderLeafSuperscript = ({
  typeSuperscript = MARK_SUPERSCRIPT,
}: SuperscriptRenderLeafOptions = {}) => ({
  children,
  leaf,
}: SuperscriptRenderLeafProps) => {
  if (leaf[typeSuperscript] && !!leaf.text) return <sup>{children}</sup>;

  return children;
};
