import React from 'react';
import { CommentNodeData } from '@udecode/plate-comments';
import {
  getRootProps,
  StyledElementProps,
} from '@udecode/plate-styled-components';
import classNames from 'classnames';
import { getCommentElementStyles } from './CommentElement.styles';

export const CommentElement = (props: StyledElementProps<CommentNodeData>) => {
  const { attributes, children, nodeProps, element } = props;

  const rootProps = getRootProps(props);
  const { root, selected } = getCommentElementStyles(props);

  return (
    <span
      {...attributes}
      css={element.selected ? selected!.css : root.css}
      className={classNames({
        [root.className]: !element.selected,
        [selected!.className]: element.selected,
      })}
      {...rootProps}
      {...nodeProps}
    >
      {children}
    </span>
  );
};
