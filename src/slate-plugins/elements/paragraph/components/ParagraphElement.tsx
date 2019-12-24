import React from 'react';
import { RenderElementProps } from 'slate-react';

export const ParagraphElement = ({
  attributes,
  children,
}: RenderElementProps) => <p {...attributes}>{children}</p>;
