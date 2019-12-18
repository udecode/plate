import React from 'react';
import { RenderLeafProps, SlatePlugin } from 'slate-react';
import { onKeyDownMark } from '../onKeyDownMark';

export const renderLeafInlineCode = ({ children, leaf }: RenderLeafProps) => {
  if (leaf.code) children = <code>{children}</code>;

  return children;
};

export const InlineCodePlugin = (): SlatePlugin => ({
  renderLeaf: renderLeafInlineCode,
  onKeyDown: onKeyDownMark({ mark: 'code', hotkey: 'mod+`' }),
});
