import React from 'react';
import { Button, ButtonProps } from '@udecode/plate-button';
import { useCommentActions } from '../stores/comment/CommentProvider';

export const useCommentEditCancelButton = (props: ButtonProps): ButtonProps => {
  const setEditingValue = useCommentActions().editingValue();

  return {
    onClick: () => {
      setEditingValue(null);
    },
    ...props,
  };
};

export const CommentEditCancelButton = (props: ButtonProps) => {
  const htmlProps = useCommentEditCancelButton(props);

  return <Button {...htmlProps} />;
};
