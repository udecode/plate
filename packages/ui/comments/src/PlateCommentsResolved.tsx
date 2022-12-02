import React from 'react';
import { useCommentsResolved } from '@udecode/plate-comments';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { PlateComment } from './PlateComment';

export const resolvedCommentsRootCss = css`
  ${tw`w-[500px]`}
`;

export const resolvedCommentsHeaderCss = css`
  ${tw`p-4 flex-none font-medium text-base mt-0 mb-0`};
  border-bottom: 1px solid rgb(218, 220, 224);
`;

export const resolvedCommentsBodyCss = css`
  ${tw`p-4 overflow-y-auto flex-auto`};

  & > * {
    ${tw`mb-4`};
  }

  & > *:last-child {
    ${tw`mb-0`};
  }
`;

export const PlateCommentsResolved = () => {
  const resolvedComments = useCommentsResolved();

  return (
    <div css={resolvedCommentsRootCss}>
      <h2 css={resolvedCommentsHeaderCss}>Resolved comments</h2>
      <div css={resolvedCommentsBodyCss}>
        {resolvedComments.map((comment) => (
          <PlateComment key={comment.id} commentId={comment.id} />
        ))}
      </div>
    </div>
  );
};
