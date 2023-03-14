import { useEffect, useRef } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  useComposedRef,
} from '@udecode/plate-common';
import {
  useCommentActions,
  useEditingCommentText,
} from '../stores/comment/CommentProvider';

export type CommentEditTextareaProps = {} & HTMLPropsAs<'textarea'>;

export const useCommentEditTextarea = ({
  ref: _ref,
  ...props
}: CommentEditTextareaProps): HTMLPropsAs<'textarea'> => {
  const setEditingValue = useCommentActions().editingValue();
  const value = useEditingCommentText();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const ref = useComposedRef(textareaRef, _ref);

  useEffect(() => {
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
      }
    }, 0);
  }, [textareaRef]);

  return {
    placeholder: 'Add a comment...',
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

export const CommentEditTextarea = createComponentAs<CommentEditTextareaProps>(
  (props) => {
    const htmlProps = useCommentEditTextarea(props);
    return createElementAs('textarea', htmlProps);
  }
);
