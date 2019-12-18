import React from 'react';
import { Plugin, RenderLeafProps } from 'slate-react';
import { onKeyDownMark } from '../onKeyDownMark';
import { UnderlinePluginOptions } from './types';

export const UNDERLINE = 'underline';

export const renderLeafUnderline = ({ children, leaf }: RenderLeafProps) => {
  if (leaf[UNDERLINE]) children = <u>{children}</u>;

  return children;
};

export const UnderlinePlugin = ({
  type = UNDERLINE,
  hotkey = 'mod+u',
}: UnderlinePluginOptions = {}): Plugin => ({
  renderLeaf: renderLeafUnderline,
  onKeyDown: onKeyDownMark({ type, hotkey }),
});
