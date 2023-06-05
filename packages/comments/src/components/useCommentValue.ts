import { useEffect, useRef } from 'react';

export const useCommentValue = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current!;
    textarea.focus();

    const { length } = textarea.value;
    textarea.setSelectionRange(length, length);
  }, [textareaRef]);

  return {
    textareaRef,
  };
};
