import React from 'react';
import { Plugin, RenderLeafProps } from 'slate-react';
import { onKeyDownMark } from '../utils/onKeyDownMark';

export const renderLeafUnderline = ({ children, leaf }: RenderLeafProps) => {
  if (leaf.underline) children = <u>{children}</u>;

  return children;
};

export const UnderlinePlugin = (): Plugin => ({
  renderLeaf: renderLeafUnderline,
  onKeyDown: onKeyDownMark('mod+u', 'underline'),
});
