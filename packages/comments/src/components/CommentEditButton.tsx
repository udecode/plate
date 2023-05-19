import React, { ButtonHTMLAttributes } from 'react';
import {
  useComment,
  useCommentActions,
} from '../stores/comment/CommentProvider';

export const useCommentEditButton = (
  props: ButtonHTMLAttributes<HTMLButtonElement>
): ButtonHTMLAttributes<HTMLButtonElement> => {
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

export function CommentEditButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  const htmlProps = useCommentEditButton(props);

  return <button type="button" {...htmlProps} />;
}
