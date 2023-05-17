import React, { ButtonHTMLAttributes } from 'react';
import { useCommentActions } from '../stores/comment/CommentProvider';

export const useCommentEditCancelButton = (
  props: ButtonHTMLAttributes<HTMLButtonElement>
): ButtonHTMLAttributes<HTMLButtonElement> => {
  const setEditingValue = useCommentActions().editingValue();

  return {
    onClick: () => {
      setEditingValue(null);
    },
    ...props,
  };
};

export const CommentEditCancelButton = (
  props: ButtonHTMLAttributes<HTMLButtonElement>
) => {
  const htmlProps = useCommentEditCancelButton(props);

  return <button type="button" {...htmlProps} />;
};
