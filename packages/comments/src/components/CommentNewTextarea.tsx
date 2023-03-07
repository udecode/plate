import { useEffect, useRef } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  useComposedRef,
} from '@udecode/plate-common';
import {
  useCommentById,
  useCommentsActions,
  useCommentsSelectors,
  useNewCommentText,
} from '../stores/comments/CommentsProvider';

export type CommentNewTextareaProps = {} & HTMLPropsAs<'textarea'>;

export const useCommentNewTextarea = ({
  ref: _ref,
  ...props
}: CommentNewTextareaProps): HTMLPropsAs<'textarea'> => {
  const setNewValue = useCommentsActions().newValue();
  const activeComment = useCommentById(
    useCommentsSelectors().activeCommentId()
  );
  const value = useNewCommentText();
  const focusTextarea = useCommentsSelectors().focusTextarea();
  const setFocusTextarea = useCommentsActions().focusTextarea();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const ref = useComposedRef(textareaRef, _ref);

  useEffect(() => {
    if (focusTextarea) {
      textareaRef.current?.focus();
      setFocusTextarea(false);
    }
  }, [focusTextarea, setFocusTextarea, textareaRef]);

  const placeholder = `${activeComment ? 'Reply...' : 'Add a comment...'}`;

  return {
    placeholder,
    rows: 1,
    ref,
    value: value ?? undefined,
    onChange: (event) => {
      setNewValue([{ type: 'p', children: [{ text: event.target.value }] }]);
    },
    ...props,
  };
};

export const CommentNewTextarea = createComponentAs<CommentNewTextareaProps>(
  (props) => {
    const htmlProps = useCommentNewTextarea(props);
    return createElementAs('textarea', htmlProps);
  }
);
