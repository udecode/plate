import React from 'react';
import { Plugin, RenderLeafProps } from 'slate-react';

export const renderLeafStrikethrough = ({
  children,
  leaf,
}: RenderLeafProps) => {
  if (leaf.strikethrough) children = <u>{children}</u>;

  return children;
};

export const StrikethroughPlugin = (): Plugin => ({
  renderLeaf: renderLeafStrikethrough,
});
