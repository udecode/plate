import React, { useEffect, useRef } from 'react';
import { CommentEditActions } from '@udecode/plate-comments';
import { buttonVariants } from '../button/PlateButton';
import { PlateCommentEditTextarea } from './PlateCommentNewTextarea';

export function PlateCommentValue() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current!;
    textarea.focus();

    const { length } = textarea.value;
    textarea.setSelectionRange(length, length);
  }, [textareaRef]);

  return (
    <div className="flex flex-col space-y-2">
      <PlateCommentEditTextarea ref={textareaRef} />

      <div className="flex space-x-2">
        <CommentEditActions.SaveButton
          className={buttonVariants({ variant: 'primary' })}
        >
          Save
        </CommentEditActions.SaveButton>

        <CommentEditActions.CancelButton className={buttonVariants()}>
          Cancel
        </CommentEditActions.CancelButton>
      </div>
    </div>
  );
}
