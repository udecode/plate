import React from 'react';
import { RenderElementProps } from 'slate-react';
import { BLOCKQUOTE } from './types';

export const renderElementBlockquote = () => ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  if (element.type === BLOCKQUOTE) {
    return <blockquote {...attributes}>{children}</blockquote>;
  }
};
