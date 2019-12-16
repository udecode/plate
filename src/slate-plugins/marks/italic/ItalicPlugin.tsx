import React from 'react';
import { Plugin, RenderLeafProps } from 'slate-react';
import { onKeyDownMark } from '../utils/onKeyDownMark';

export const renderLeafItalic = ({ children, leaf }: RenderLeafProps) => {
  if (leaf.italic) children = <em>{children}</em>;

  return children;
};

export const ItalicPlugin = (): Plugin => ({
  renderLeaf: renderLeafItalic,
  onKeyDown: onKeyDownMark('mod+i', 'italic'),
});
