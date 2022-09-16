import { css } from 'styled-components';
import tw from 'twin.macro';

export const threadRootCss = css`
  ${tw`rounded-lg bg-white border-2 p-3`}
`;

export const threadButtonsCss = css`
  ${tw`w-full flex gap-2 mt-2`}
`;

const buttonStyle = tw`relative inline-block text-center border whitespace-nowrap outline-none align-middle rounded shadow-none box-border font-medium text-sm leading-4 select-none cursor-pointer w-20`;

export const threadSubmitButtonCss = css`
  ${[
    buttonStyle,
    tw`ml-auto h-6 bg-blue-400 text-white border-blue-400 disabled:bg-blue-100 disabled:cursor-default disabled:border-blue-200`,
  ]};
`;

export const threadCancelButtonCss = css`
  ${[
    buttonStyle,
    tw`h-6 bg-red-400 text-white border-red-400 disabled:bg-red-100 disabled:cursor-default disabled:border-red-200`,
  ]};
`;
