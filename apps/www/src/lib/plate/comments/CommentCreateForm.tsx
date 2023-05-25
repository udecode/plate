import React, { useRef } from 'react';
import { useCommentsSelectors } from '@udecode/plate-comments';
import { CommentAvatar } from './CommentAvatar';
import { CommentNewSubmitButton } from './CommentNewSubmitButton';
import { PlateCommentNewTextarea } from './PlateCommentNewTextarea';

export function CommentCreateForm() {
  const myUserId = useCommentsSelectors().myUserId();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  return (
    <div className="relative block cursor-default whitespace-normal bg-background text-left text-sm font-normal text-black outline-none">
      <div className="flex w-full space-x-2">
        <CommentAvatar userId={myUserId} />

        <div className="flex grow flex-col space-y-2">
          <PlateCommentNewTextarea ref={textareaRef} />

          <div className="block select-text whitespace-normal text-left text-sm font-normal text-black [-webkit-tap-highlight-color:rgba(0,0,0,0)] [zoom:1]">
            <CommentNewSubmitButton />
          </div>
        </div>
      </div>
    </div>
  );
}
