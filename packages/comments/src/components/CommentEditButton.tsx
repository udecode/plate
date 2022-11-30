import React from 'react';
import { Button, ButtonProps } from '@udecode/plate-button';
import {
  useComment,
  useCommentActions,
} from '../stores/comment/CommentProvider';

export const useCommentEditButton = (props: ButtonProps): ButtonProps => {
  const setIsMenuOpen = useCommentActions().isMenuOpen();
  const comment = useComment()!;
  const editingValue = useCommentActions().editingValue();

  return {
    onClick: () => {
      setIsMenuOpen(false);
      editingValue(comment.value);
    },
    ...props,
  };
};

export const CommentEditButton = (props: ButtonProps) => {
  const htmlProps = useCommentEditButton(props);

  return <Button {...htmlProps} />;
};
