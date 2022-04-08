import React from 'react';
import { CommentNodeData } from '@udecode/plate-comments';
import {
  getRootProps,
  StyledElementProps,
} from '@udecode/plate-styled-components';
import { getCommentElementStyles } from './CommentElement.styles';

export const CommentElement = (props: StyledElementProps<CommentNodeData>) => {
  const { attributes, children, nodeProps, element } = props;

  const rootProps = getRootProps(props);
  const { root } = getCommentElementStyles(props);

  return (
    <span
      {...attributes}
      css={root.css}
      className={root.className}
      {...rootProps}
      {...nodeProps}
    >
      {children}
    </span>
  );
};
