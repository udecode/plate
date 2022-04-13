import React, { useCallback, useEffect, useRef } from 'react';
import { StyledProps } from '@udecode/plate-styled-components';
import {
  createButtonsStyles,
  createCancelButtonStyles,
  createCommentButtonStyles,
  createCommentInputStyles,
  createTextAreaStyles,
} from '../SideThread.styles';

export function SideThreadCommentEditing({
  defaultText,
  onSave: onSaveCallback,
  onCancel,
  ...props
}: {
  defaultText: string;
  onSave: (text: string) => void;
  onCancel: () => void;
} & StyledProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const { root: commentInput } = createCommentInputStyles(props);
  const { root: textArea } = createTextAreaStyles(props);
  const { root: buttons } = createButtonsStyles(props);
  const { root: commentButton } = createCommentButtonStyles(props);
  const { root: cancelButton } = createCancelButtonStyles(props);

  const onSave = useCallback(
    function onSave() {
      onSaveCallback(textAreaRef.current!.value);
    },
    [onSaveCallback, textAreaRef]
  );

  useEffect(
    function focus() {
      textAreaRef.current!.focus();
    },
    [textAreaRef]
  );

  return (
    <div css={commentInput.css} className={commentInput.className}>
      <textarea
        ref={textAreaRef}
        rows={1}
        css={textArea.css}
        className={textArea.className}
        defaultValue={defaultText}
      />
      <div css={buttons.css} className={buttons.className}>
        <button
          type="button"
          css={commentButton.css}
          className={commentButton.className}
          onClick={onSave}
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
