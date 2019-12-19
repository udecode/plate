import React from 'react';
import { ElementType } from 'slate-plugins/common';
import { RenderElementProps } from 'slate-react';

export const renderElementCode = () => ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  if (element.type === ElementType.CODE) {
    return (
      <pre>
        <code {...attributes}>{children}</code>
      </pre>
    );
  }
};
