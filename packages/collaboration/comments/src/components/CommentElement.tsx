import React from 'react';
import { PlateRenderElementProps } from '@udecode/plate-core';

export const CommentElement = (props: PlateRenderElementProps) => {
  const { attributes, children } = props;

  return <div {...attributes}>{children}</div>;
};
