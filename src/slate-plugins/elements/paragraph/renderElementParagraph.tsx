import React from 'react';
import { RenderElementProps } from 'slate-react';
import { PARAGRAPH } from './types';

export const renderElementParagraph = () => ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  if (element.type === PARAGRAPH) {
    return <p {...attributes}>{children}</p>;
  }
};
