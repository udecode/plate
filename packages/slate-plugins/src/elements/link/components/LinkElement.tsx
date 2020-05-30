import * as React from 'react';
import { LinkRenderElementProps } from '../types';

export const LinkElement = ({
  attributes,
  children,
  element,
}: LinkRenderElementProps) => (
  <a {...attributes} href={element.url}>
    {children}
  </a>
);
