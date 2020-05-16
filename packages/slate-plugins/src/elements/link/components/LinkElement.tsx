import React from 'react';
import { RenderElementProps } from 'slate-react';

export const LinkElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => (
  <a {...attributes} href={element.url as string}>
    {children}
  </a>
);
