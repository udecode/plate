import React from 'react';
import { Plugin, RenderLeafProps } from 'slate-react';
import { onKeyDownMark } from '../utils/onKeyDownMark';

export const renderLeafBold = ({ children, leaf }: RenderLeafProps) => {
  if (leaf.bold) children = <strong>{children}</strong>;

  return children;
};

export const BoldPlugin = (): Plugin => ({
  renderLeaf: renderLeafBold,
  onKeyDown: onKeyDownMark('mod+b', 'bold'),
});
