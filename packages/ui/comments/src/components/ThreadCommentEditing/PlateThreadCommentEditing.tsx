import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Thread as ThreadType, User } from '@udecode/plate-comments';
import { PlateTextArea } from '../TextArea/PlateTextArea';
import {
  threadCommentEditingActionsCss,
  threadCommentEditingCancelButtonCss,
  threadCommentEditingRootCss,
  threadCommentEditingSaveButtonCss,
} from './styles';
import { ThreadCommentEditing } from './ThreadCommentEditing';

export type PlateThreadCommentEditingProps = {
  thread: ThreadType;
  defaultText: string;
  onSave: (text: string) => void;
  onCancel: () => void;
  fetchContacts: () => User[];
};

export const PlateThreadCommentEditing = (
  props: PlateThreadCommentEditingProps
) => {
  const { thread, defaultText, fetchContacts, onSave } = props;

  const [value, setValue] = useState<string>(defaultText);
  const [haveContactsBeenClosed, setHaveContactsBeenClosed] = useState<boolean>(
    false
  );

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const onSubmit = useCallback(() => {
    onSave(value);
  }, [value, onSave]);

  const onValueChange = useCallback((newValue) => {
    setValue(newValue);
  }, []);

  useEffect(
    function onShow() {
      const textArea = textAreaRef.current!;
      textArea.focus();
      const { length } = textArea.value;
      textArea.setSelectionRange(length, length);
    },
    [textAreaRef, thread]
  );

  return (
    <div css={threadCommentEditingRootCss}>
      <PlateTextArea
        fetchContacts={fetchContacts}
        haveContactsBeenClosed={haveContactsBeenClosed}
        onSubmit={onSubmit}
        onValueChange={onValueChange}
        ref={textAreaRef}
        setHaveContactsBeenClosed={setHaveContactsBeenClosed}
        thread={thread}
        value={value}
      />
      <div css={threadCommentEditingActionsCss}>
        <ThreadCommentEditing.SaveButton
          {...props}
          value={value}
          css={threadCommentEditingSaveButtonCss}
        >
          Save
        </ThreadCommentEditing.SaveButton>
        <ThreadCommentEditing.CancelButton
          {...props}
          css={threadCommentEditingCancelButtonCss}
        >
          Cancel
        </ThreadCommentEditing.CancelButton>
      </div>
    </div>
  );
};
