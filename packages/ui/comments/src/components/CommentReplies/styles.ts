import { css } from 'styled-components';
import tw from 'twin.macro';

export const commentsRootCss = css`
  ${tw`rounded-lg bg-white`};
  box-shadow: 0 2px 6px 2px rgb(60 64 67 / 15%);
  border: 1px solid white;
`;

export const threadCommentHeadCss = css`
  ${tw`box-content font-normal text-left text-black text-sm cursor-default h-10 whitespace-nowrap flex m-0 p-3 items-center`};
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  direction: ltr;
  user-select: text;
`;

export const threadUserTimestampCss = css`
  ${tw`font-normal text-left text-black text-sm cursor-pointer pl-2 overflow-hidden whitespace-nowrap flex-grow flex flex-col justify-center`};
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  direction: ltr;
  user-select: text;
  text-overflow: ellipsis;
  -webkit-box-flex: 1;
  align-items: start;
`;

export const threadCommenterNameCss = css`
  ${tw`text-left cursor-default whitespace-nowrap overflow-hidden m-0 h-4 self-stretch text-gray-800 font-medium text-sm leading-5 mr-1`};
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  direction: ltr;
  user-select: text;
  text-overflow: ellipsis;
  letter-spacing: 0.25px;
`;

export const threadActionsCss = css`
  ${tw`font-normal text-black whitespace-normal text-sm text-left pt-2 block`};
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  direction: ltr;
  user-select: text;
  zoom: 1;
`;

export const submitCommentButtonCss = css`
  ${tw`relative inline-block text-center whitespace-nowrap outline-none align-middle rounded shadow-none box-border font-medium text-sm leading-4 h-6 bg-blue-600 text-white select-none cursor-pointer`};
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  direction: ltr;
  margin: 0 8px 0 0;
  min-width: 24px;
  border: 1px solid transparent;
  letter-spacing: 0.25px;
  padding: 3px 12px 5px;

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

export const cancelCommentButtonCss = css`
  ${tw`relative inline-block text-center whitespace-nowrap outline-none align-middle rounded shadow-none box-border font-medium text-sm leading-4 bg-white h-6 text-blue-600 select-none cursor-pointer border-solid border my-0 ml-0 mr-2 py-1 px-3 tracking-wide`};
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  direction: ltr;
  min-width: 24px;
  border-color: rgba(218, 220, 224, 1);

  &:hover {
    background-color: #f8fbff;
    border-color: #cce0fc !important;
  }

  &:active {
    background-color: #e1ecfe;
    color: #1a73e8;
  }

  &:hover:active {
    box-shadow: 0 2px 6px 2px rgb(60 64 67 / 15%);
  }
`;

export const threadCommentInputCss = css`
  ${tw`bg-white cursor-default block text-sm px-3 pt-0 pb-3 relative text-left text-black whitespace-normal`};
  font-weight: normal;
  direction: ltr;
  unicode-bidi: isolate;
  outline: none;
`;

export const threadCommentInputReplyCss = css`
  ${tw`border-solid border-t mt-3 pt-3`};
  border-color: rgba(218, 220, 224, 1);
`;
