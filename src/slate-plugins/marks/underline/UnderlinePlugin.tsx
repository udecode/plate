import React from 'react';
import { RenderLeafProps, SlatePlugin } from 'slate-react';
import { onKeyDownMark } from '../onKeyDownMark';
import { UNDERLINE, UnderlinePluginOptions } from './types';

export const renderLeafUnderline = ({ children, leaf }: RenderLeafProps) => {
  if (leaf[UNDERLINE]) children = <u>{children}</u>;

  return children;
};

export const UnderlinePlugin = ({
  mark = UNDERLINE,
  hotkey = 'mod+u',
}: UnderlinePluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafUnderline,
  onKeyDown: onKeyDownMark({ mark, hotkey }),
});
