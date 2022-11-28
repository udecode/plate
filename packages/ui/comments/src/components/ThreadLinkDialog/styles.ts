import { css } from 'styled-components';
import tw from 'twin.macro';

export const commentLinkDialogHeaderCss = css`
  ${tw`flex justify-between items-center`}
`;

export const commentLinkDialogCloseButtonCss = css`
  ${tw`h-8 p-2 w-8`}
`;

export const commentLinkDialogInputCss = css`
  ${tw`w-full h-8 border-color[#1976d2] outline-none border rounded-lg p-1 my-2`}
`;

export const commentLinkDialogCopyButtonCss = css`
  ${tw`w-full flex flex-row-reverse	mt-2`}
`;
