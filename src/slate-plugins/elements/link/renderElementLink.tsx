import React from 'react';
import { RenderElementProps } from 'slate-react';
import { LINK } from './types';

export const renderElementLink = () => ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  if (element.type === LINK) {
    return (
      <a {...attributes} href={element.url}>
        {children}
      </a>
    );
  }
};
