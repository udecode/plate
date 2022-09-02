import { useCallback, useEffect, useRef, useState } from 'react';
import { ThreadCommentEditingProps } from './ThreadCommentEditing.types';

export const useThreadCommentEditing = (props: ThreadCommentEditingProps) => {
  const { thread, defaultText, onSave, onCancel, fetchContacts } = props;

  const [value, setValue] = useState(defaultText);
  const [haveContactsBeenClosed, setHaveContactsBeenClosed] = useState(false);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const disabled =
    value.trim().length === 0 || value.trim() === defaultText.trim();

  const onSaveComment = useCallback(() => {
    onSave(value);
  }, [onSave, value]);

  const onChange = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  useEffect(() => {
    const textArea = textAreaRef.current!;
    textArea.focus();
    const { length } = textArea.value;
    textArea.setSelectionRange(length, length);
  }, [textAreaRef, thread]);

  return {
    disabled,
    fetchContacts,
    haveContactsBeenClosed,
    onCancel,
    onChange,
    onSaveComment,
    setHaveContactsBeenClosed,
    textAreaRef,
    thread,
    value,
  } as const;
};
