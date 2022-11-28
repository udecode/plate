import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PlateCommentTextArea } from '../TextArea/PlateCommentTextArea';
import {
  threadCommentEditingActionsCss,
  threadCommentEditingCancelButtonCss,
  threadCommentEditingRootCss,
  threadCommentEditingSaveButtonCss,
} from './styles';
import { ThreadCommentEditing } from './ThreadCommentEditing';

export type PlateThreadCommentEditingProps = {
  commentId: string;
  defaultText?: string;
  onSave?: (text: string) => void;
  onCancel?: () => void;
};

export const PlateThreadCommentEditing = (
  props: PlateThreadCommentEditingProps
) => {
  const { commentId, defaultText = '', onSave } = props;

  const [value, setValue] = useState<string>(defaultText);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const onSubmit = useCallback(() => {
    onSave?.(value);
  }, [value, onSave]);

  const onValueChange = useCallback((newValue) => {
    setValue(newValue);
  }, []);

  useEffect(() => {
    const textArea = textAreaRef.current!;
    textArea.focus();
    const { length } = textArea.value;
    textArea.setSelectionRange(length, length);
  }, [textAreaRef]);

  return (
    <div css={threadCommentEditingRootCss}>
      <PlateCommentTextArea
        ref={textAreaRef}
        commentId={commentId}
        onSubmit={onSubmit}
        onValueChange={onValueChange}
      />
      <div css={threadCommentEditingActionsCss}>
        <ThreadCommentEditing.SaveButton
          {...props}
          commentId={commentId}
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
