import * as React from 'react';
import {
  MARK_SUBSCRIPT,
  SubscriptRenderLeafOptions,
  SubscriptRenderLeafProps,
} from './types';

export const renderLeafSubscript = ({
  typeSubscript = MARK_SUBSCRIPT,
}: SubscriptRenderLeafOptions = {}) => ({
  children,
  leaf,
}: SubscriptRenderLeafProps) => {
  if (leaf[typeSubscript] && !!leaf.text) return <sub>{children}</sub>;

  return children;
};
