import React from 'react';
import { RenderLeafProps, SlatePlugin } from 'slate-react';

export const renderLeafStrikethrough = ({
  children,
  leaf,
}: RenderLeafProps) => {
  if (leaf.strikethrough) children = <u>{children}</u>;

  return children;
};

export const StrikethroughPlugin = (): SlatePlugin => ({
  renderLeaf: renderLeafStrikethrough,
});
