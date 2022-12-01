import React, { useEffect, useRef } from 'react';
import { CommentEditActions } from '@udecode/plate-comments';
import { plateButtonCss, primaryButtonCss } from '@udecode/plate-ui-button';
import tw from 'twin.macro';
import { PlateCommentEditTextarea } from './PlateCommentNewTextarea';

export const PlateCommentValue = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current!;
    textarea.focus();

    const { length } = textarea.value;
    textarea.setSelectionRange(length, length);
  }, [textareaRef]);

  return (
    <div css={tw`flex flex-col space-y-2`}>
      <PlateCommentEditTextarea ref={textareaRef} />

      <div css={[tw`flex space-x-2`]}>
        <CommentEditActions.SaveButton css={[primaryButtonCss]}>
          Save
        </CommentEditActions.SaveButton>

        <CommentEditActions.CancelButton css={[plateButtonCss]}>
          Cancel
        </CommentEditActions.CancelButton>
      </div>
    </div>
  );
};
