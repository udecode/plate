import { useCallback } from 'react';
import { useCommentsSelectors } from '@udecode/plate-comments';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ThreadCommentEditingSaveButtonProps = {
  commentId: string;
  onSave?: (text: string) => void;
  defaultText?: string;
} & HTMLPropsAs<'button'>;

export const useThreadCommentEditingSaveButton = ({
  commentId,
  onSave,
  defaultText,
  ...props
}: ThreadCommentEditingSaveButtonProps) => {
  const value = useCommentsSelectors().commentText(commentId);

  const onClick = useCallback(() => {
    onSave?.(value);
  }, [onSave, value]);

  return {
    onClick,
    disabled: value.trim().length === 0 || value.trim() === defaultText?.trim(),
    ...props,
  };
};

export const ThreadCommentEditingSaveButton = createComponentAs<ThreadCommentEditingSaveButtonProps>(
  (props) => {
    const htmlProps = useThreadCommentEditingSaveButton(props);
    return createElementAs('button', htmlProps);
  }
);
