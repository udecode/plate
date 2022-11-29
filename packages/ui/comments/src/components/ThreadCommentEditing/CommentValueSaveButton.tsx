import { useCallback } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { useCommentText } from '../CommentProvider';

export type CommentValueSaveButtonProps = {
  defaultText?: string;
} & HTMLPropsAs<'button'>;

export const useCommentValueSaveButton = ({
  defaultText,
  ...props
}: CommentValueSaveButtonProps) => {
  const value = useCommentText();

  const onClick = useCallback(() => {
    // onSave?.(value);
  }, []);

  return {
    onClick,
    disabled:
      value?.trim().length === 0 || value?.trim() === defaultText?.trim(),
    ...props,
  };
};

export const CommentValueSaveButton = createComponentAs<CommentValueSaveButtonProps>(
  (props) => {
    const htmlProps = useCommentValueSaveButton(props);
    return createElementAs('button', htmlProps);
  }
);
