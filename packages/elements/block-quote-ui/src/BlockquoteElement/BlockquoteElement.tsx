import * as React from 'react';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { getBlockquoteElementStyles } from './BlockquoteElement.styles';

export const BlockquoteElement = (props: StyledElementProps) => {
  const { attributes, children, nodeProps } = props;

  const { root } = getBlockquoteElementStyles(props);

  return (
    <blockquote
      {...attributes}
      css={root.css}
      className={root.className}
      {...nodeProps}
    >
      {children}
    </blockquote>
  );
};
