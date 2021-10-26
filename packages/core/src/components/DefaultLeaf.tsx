import React from 'react';
import { RenderLeafProps } from 'slate-react';

export const DefaultLeaf = (props: RenderLeafProps) => {
  const { attributes, children, ...additionalProps } = props;
  return (
    <span {...attributes} {...additionalProps}>
      {children}
    </span>
  );
};
