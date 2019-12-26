import React from 'react';
import { RenderElementProps } from 'slate-react';

export const BlockquoteElement = ({
  attributes,
  children,
}: RenderElementProps) => <blockquote {...attributes}>{children}</blockquote>;
