import { css } from 'styled-components';
import tw from 'twin.macro';

export const threadCommentRootCss = css`
  ${[]}
`;
export const threadCommentActionsCss = css`
  ${[tw`ml-auto flex gap-1.5`]}
`;

export const threadCommentCommentHeaderCss = css`
  ${tw`flex items-center whitespace-nowrap h-9 p-3 mt-2 font-normal text-left text-black text-sm cursor-default`};
`;

export const threadCommentAuthorTimestampCss = css`
  ${tw`flex flex-col content-center items-start font-normal text-left text-black whitespace-nowrap text-sm ml-3`};
`;

export const threadCommentCommenterNameCss = css`
  ${tw`text-gray-700 text-sm text-left font-medium whitespace-nowrap`};
`;

export const threadCommentTimestampCss = css`
  ${tw`text-gray-500 text-xs text-left whitespace-nowrap tracking-wide`};
`;

export const threadCommentThreadCommentTextCss = css`
  ${tw`text-sm whitespace-pre-wrap px-3 py-2`}
`;
