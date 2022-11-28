import { useCallback, useEffect, useRef } from 'react';
import { useCommentsSelectors } from '@udecode/plate-comments';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  useComposedRef,
} from '@udecode/plate-core';

export type CommentTextAreaProps = {
  commentId: string;
  onValueChange?: (newValue: string) => void;
  onSubmit?: () => void;
} & HTMLPropsAs<'textarea'>;

export const useCommentTextArea = ({
  commentId,
  onValueChange,
  onSubmit,
  ref: _ref,
  ...props
}: CommentTextAreaProps): HTMLPropsAs<'textarea'> => {
  const comment = useCommentsSelectors().comment(commentId);

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const ref = useComposedRef(textAreaRef, _ref);

  useEffect(() => {
    setTimeout(() => {
      const textArea = textAreaRef.current;
      if (textArea) {
        textArea.focus();
      }
    }, 0);
  }, [textAreaRef]);

  const placeholder = `${!comment.value ? 'Reply...' : 'Add a comment...'}`;

  const onChange = useCallback(
    (event) => {
      onValueChange?.(event.target.value);
    },
    [onValueChange]
  );

  return { placeholder, rows: 1, onChange, ref, ...props };
};

export const CommentTextArea = createComponentAs<CommentTextAreaProps>(
  (props) => {
    const htmlProps = useCommentTextArea(props);
    return createElementAs('textarea', htmlProps);
  }
);
