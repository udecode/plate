import { useEffect, useRef } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  useComposedRef,
} from '@udecode/plate-core';
import {
  useCommentById,
  useCommentsActions,
  useCommentsSelectors,
  useEditingCommentText,
} from '../CommentsProvider';

export type CommentTextAreaProps = {} & HTMLPropsAs<'textarea'>;

export const useCommentTextArea = ({
  ref: _ref,
  ...props
}: CommentTextAreaProps): HTMLPropsAs<'textarea'> => {
  const setEditingValue = useCommentsActions().editingValue();
  const activeComment = useCommentById(
    useCommentsSelectors().activeCommentId()
  );
  const value = useEditingCommentText();
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

  const placeholder = `${activeComment ? 'Reply...' : 'Add a comment...'}`;

  return {
    placeholder,
    rows: 1,
    ref,
    value: value ?? undefined,
    onChange: (event) => {
      setEditingValue([
        { type: 'p', children: [{ text: event.target.value }] },
      ]);
    },
    ...props,
  };
};

export const CommentTextArea = createComponentAs<CommentTextAreaProps>(
  (props) => {
    const htmlProps = useCommentTextArea(props);
    return createElementAs('textarea', htmlProps);
  }
);
