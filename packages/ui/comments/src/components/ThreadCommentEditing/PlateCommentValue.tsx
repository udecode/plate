import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PlateCommentTextArea } from '../TextArea/PlateCommentTextArea';
import { CommentValueActions } from './CommentValueActions';
import {
  threadCommentEditingActionsCss,
  threadCommentEditingCancelButtonCss,
  threadCommentEditingRootCss,
  threadCommentEditingSaveButtonCss,
} from './styles';

export type PlateCommentValueProps = {
  defaultText?: string;
};

export const PlateCommentValue = (props: PlateCommentValueProps) => {
  const { defaultText = '' } = props;

  const [value, setValue] = useState<string>(defaultText);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const onSubmit = useCallback(() => {
    // onSave?.(value);
  }, []);

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
      <PlateCommentTextArea ref={textAreaRef} />
      <div css={threadCommentEditingActionsCss}>
        <CommentValueActions.SaveButton
          {...props}
          css={threadCommentEditingSaveButtonCss}
        >
          Save
        </CommentValueActions.SaveButton>
        <CommentValueActions.CancelButton
          {...props}
          css={threadCommentEditingCancelButtonCss}
        >
          Cancel
        </CommentValueActions.CancelButton>
      </div>
    </div>
  );
};
