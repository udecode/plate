import React from 'react';
import { RenderElementProps } from 'slate-react';
import { LINK } from '../types';

export const LinkElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => (
  <a {...attributes} data-slate-type={LINK} href={element.url}>
    {children}
  </a>
);
