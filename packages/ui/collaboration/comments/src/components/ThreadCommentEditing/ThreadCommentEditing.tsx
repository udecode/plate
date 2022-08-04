import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyledProps } from '@udecode/plate-styled-components';
import { Thread as ThreadModel } from '@xolvio/plate-comments/dist/Thread';
import { FetchContacts } from '../../types';
import { TextArea } from '../TextArea/TextArea';
import {
  createButtonsStyles,
  createCancelButtonStyles,
  createCommentButtonStyles,
  createCommentInputStyles,
} from '../Thread/Thread.styles';

export function ThreadCommentEditing({
  thread,
  defaultText,
  onSave: onSaveCallback,
  onCancel,
  fetchContacts,
  ...props
}: {
  thread: ThreadModel;
  defaultText: string;
  onSave: (text: string) => void;
  onCancel: () => void;
  fetchContacts: FetchContacts;
} & StyledProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [value, setValue] = useState<string>(defaultText);

  const [haveContactsBeenClosed, setHaveContactsBeenClosed] = useState<boolean>(
    false
  );

  const { root: commentInput } = createCommentInputStyles(props);
  const { root: buttons } = createButtonsStyles(props);
  const { root: commentButton } = createCommentButtonStyles(props);
  const { root: cancelButton } = createCancelButtonStyles(props);

  const onSave = useCallback(
    async function onSave() {
      await onSaveCallback(value);
    },
    [onSaveCallback, value]
  );

  useEffect(
    function onShow() {
      const textArea = textAreaRef.current!;
      textArea.focus();
      const { length } = textArea.value;
      textArea.setSelectionRange(length, length);
    },
    [textAreaRef, thread]
  );

  const onChange = useCallback(function onChange(newValue) {
    setValue(newValue);
  }, []);

  return (
    <div css={commentInput.css} className={commentInput.className}>
      <TextArea
        ref={textAreaRef}
        value={value}
        onChange={onChange}
        thread={thread}
        fetchContacts={fetchContacts}
        haveContactsBeenClosed={haveContactsBeenClosed}
        setHaveContactsBeenClosed={setHaveContactsBeenClosed}
        onSubmit={onSave}
      />
      <div css={buttons.css} className={buttons.className}>
        <button
          type="button"
          css={commentButton.css}
          className={commentButton.className}
          onClick={onSave}
          disabled={
            value.trim().length === 0 || value.trim() === defaultText.trim()
          }
        >
          Save
        </button>
        <button
          type="button"
          css={cancelButton.css}
          className={cancelButton.className}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
