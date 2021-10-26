import React from 'react';
import { RenderLeafProps } from 'slate-react';

export const DefaultLeaf = (props: RenderLeafProps) => {
  // text and leaf is included so it won't be rendered bz the span from the additionalProps
  const { attributes, children, text, leaf, ...additionalProps } = props;
  return (
    <span {...attributes} {...additionalProps}>
      {children}
    </span>
  );
};
