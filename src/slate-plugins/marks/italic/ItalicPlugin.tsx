import React from 'react';
import { RenderLeafProps, SlatePlugin } from 'slate-react';
import { onKeyDownMark } from '../onKeyDownMark';

export const renderLeafItalic = ({ children, leaf }: RenderLeafProps) => {
  if (leaf.italic) children = <em>{children}</em>;

  return children;
};

export const ItalicPlugin = (): SlatePlugin => ({
  renderLeaf: renderLeafItalic,
  onKeyDown: onKeyDownMark({ mark: 'italic', hotkey: 'mod+i' }),
});
