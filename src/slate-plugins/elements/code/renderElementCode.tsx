import React from 'react';
import { RenderElementProps } from 'slate-react';
import { CODE } from './types';

export const renderElementCode = () => ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  if (element.type === CODE) {
    return (
      <pre>
        <code {...attributes}>{children}</code>
      </pre>
    );
  }
};
