import { css } from 'styled-components';
import tw from 'twin.macro';

export const threadCommentEditingRootCss = css`
  ${tw`bg-white cursor-default block text-sm px-3 pt-0 pb-3 relative text-left text-black whitespace-normal`};
  font-weight: normal;
  font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
  direction: ltr;
  unicode-bidi: isolate;
  outline: none;
`;

export const threadCommentEditingActionsCss = css`
  ${tw`cursor-pointer block text-sm pt-2 text-left text-black whitespace-normal`};
  font-weight: normal;
  font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
  direction: ltr;
`;

export const threadCommentEditingSaveButtonCss = css`
  ${tw`border-transparent rounded border-solid border box-border cursor-pointer inline-block font-medium h-6 text-sm leading-4 my-0 ml-0 mr-2 py-1 px-3 relative shadow-none text-center text-white tracking-wide select-none align-middle whitespace-nowrap`};
  direction: ltr;
  outline: 0px;
  min-width: 24px;
  font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
  background-color: rgba(26, 115, 232, 1);

  &:hover {
    ${tw`text-white`};
    background-color: #2b7de9;
    box-shadow: 0 1px 3px 1px rgb(66 133 244 / 15%);
  }

  &:active {
    ${tw`text-white`};
    background-color: #63a0ef;
    box-shadow: 0 2px 6px 2px rgb(66 133 244 / 15%);
  }

  &[disabled] {
    background-color: #f1f3f4;
    color: #3c4043;
    opacity: 0.38;
    cursor: default;
  }
`;

export const threadCommentEditingCancelButtonCss = css`
  ${tw`bg-white rounded border-solid border box-border cursor-pointer inline-block font-medium h-6 text-sm leading-4 my-0 ml-0 mr-2 py-1 px-3 relative shadow-none text-center tracking-wide select-none align-middle whitespace-nowrap`};
  font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
  direction: ltr;
  outline: 0px;
  min-width: 24px;
  border-color: rgba(218, 220, 224, 1);
  color: rgba(26, 115, 232, 1);

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
