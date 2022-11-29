import { useCallback, useEffect, useRef } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  useComposedRef,
} from '@udecode/plate-core';
import { SCOPE_ACTIVE_COMMENT } from '../ActiveCommentProvider';
import { useComment } from '../CommentProvider';

export type CommentTextAreaProps = {} & HTMLPropsAs<'textarea'>;

export const useCommentTextArea = ({
  ref: _ref,
  ...props
}: CommentTextAreaProps): HTMLPropsAs<'textarea'> => {
  const comment = useComment(SCOPE_ACTIVE_COMMENT)!;

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

  const onChange = useCallback(() => {
    // onValueChange?.(event.target.value);
  }, []);

  return { placeholder, rows: 1, onChange, ref, ...props };
};

export const CommentTextArea = createComponentAs<CommentTextAreaProps>(
  (props) => {
    const htmlProps = useCommentTextArea(props);
    return createElementAs('textarea', htmlProps);
  }
);
