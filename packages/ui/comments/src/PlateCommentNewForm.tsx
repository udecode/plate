import React, { useRef } from 'react';
import { useCommentsSelectors } from '@udecode/plate-comments';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { PlateAvatar } from './PlateAvatar';
import { PlateCommentNewSubmitButton } from './PlateCommentNewSubmitButton';
import { PlateCommentNewTextarea } from './PlateCommentNewTextarea';

export const commentActionsCss = css`
  ${tw`font-normal text-black whitespace-normal text-sm text-left block`};
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  user-select: text;
  zoom: 1;
`;

export const commentFormCss = css`
  ${tw`bg-white cursor-default block text-sm relative text-left text-black whitespace-normal`};
  font-weight: normal;
  outline: none;
`;

export const PlateCommentNewForm = () => {
  const myUserId = useCommentsSelectors().myUserId();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  return (
    <div css={[commentFormCss]}>
      <div className="flex w-full space-x-2">
        <PlateAvatar userId={myUserId} />

        <div className="flex flex-grow flex-col space-y-2">
          <PlateCommentNewTextarea ref={textareaRef} />

          <div css={commentActionsCss}>
            <PlateCommentNewSubmitButton />
          </div>
        </div>
      </div>
    </div>
  );
};
