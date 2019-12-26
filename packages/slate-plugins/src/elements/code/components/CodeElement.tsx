import React from 'react';
import { RenderElementProps } from 'slate-react';

export const CodeElement = ({ attributes, children }: RenderElementProps) => (
  <pre>
    <code {...attributes}>{children}</code>
  </pre>
);
