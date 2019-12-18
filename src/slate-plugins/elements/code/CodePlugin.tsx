import React from 'react';
import { ElementType } from 'slate-plugins/common';
import { RenderElementProps, SlatePlugin } from 'slate-react';

export const renderElementCode = ({
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

export const CodePlugin = (): SlatePlugin => ({
  renderElement: renderElementCode,
});
