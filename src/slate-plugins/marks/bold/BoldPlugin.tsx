import React from 'react';
import { RenderLeafProps, SlatePlugin } from 'slate-react';
import { onKeyDownMark } from '../onKeyDownMark';

export const renderLeafBold = ({ children, leaf }: RenderLeafProps) => {
  if (leaf.bold) children = <strong>{children}</strong>;

  return children;
};

export const BoldPlugin = (): SlatePlugin => ({
  renderLeaf: renderLeafBold,
  onKeyDown: onKeyDownMark({ mark: 'bold', hotkey: 'mod+b' }),
});
