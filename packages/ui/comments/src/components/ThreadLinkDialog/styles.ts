import { css } from 'styled-components';
import tw from 'twin.macro';

export const threadLinkDialogRootCss = css`
  ${tw`fixed w-96 h-32 bg-gray-400 rounded-lg px-4 py-2 top-1/2 left-1/2`}
  transform: translate(-50%, -50%);
`;
export const threadLinkDialogHeaderCss = css`
  ${tw`flex justify-between items-center px-0 py-3`};
  h3 {
    ${tw`p-0 m-0`};
  }
`;

export const threadLinkDialogCloseButtonCss = css`
  ${tw`flex p-1 w-7 h-7 bg-transparent border-none cursor-pointer rounded-lg bg-gray-200 hover:bg-gray-300`}
`;

export const threadLinkDialogLinkCss = css`
  ${tw`flex p-2 rounded bg-gray-100 mt-5 mb-3`};
  input {
    ${tw`w-full border-0 select-all outline-none bg-transparent`};
  }
  svg {
    ${tw`cursor-pointer w-5`};
  }
`;
