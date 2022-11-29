import React from 'react';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { NewCommentSubmitButton } from './NewCommentSubmitButton';

export const submitCommentButtonCss = css`
  ${tw`relative inline-block text-center whitespace-nowrap outline-none align-middle rounded shadow-none box-border font-medium text-sm leading-4 h-6 bg-blue-600 text-white select-none cursor-pointer`};
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  min-width: 24px;
  border: 1px solid transparent;
  letter-spacing: 0.25px;

  &:hover {
    ${tw`bg-blue-600 text-white`};
    box-shadow: 0 1px 3px 1px rgb(66 133 244 / 15%);
  }

  &:active {
    ${tw`bg-blue-400 text-white`};
    box-shadow: 0 2px 6px 2px rgb(66 133 244 / 15%);
  }

  &[disabled] {
    ${tw`bg-gray-200 text-gray-800 cursor-default`};
    opacity: 0.38;
  }
`;

export const PlateNewCommentSubmitButton = () => {
  return <NewCommentSubmitButton css={submitCommentButtonCss} />;
};
