import { css } from 'styled-components';
import tw from 'twin.macro';

export const threadRootCss = css`
  ${tw`rounded-lg bg-white border`}
`;

export const threadButtonsCss = css`
  ${tw`w-full flex gap-2`}
`;

const buttonStyle = tw`relative inline-block text-center border whitespace-nowrap outline-none align-middle rounded shadow-none box-border font-medium text-sm leading-4 select-none cursor-pointer w-20`;

export const threadSubmitButtonCss = css`
  ${[
    buttonStyle,
    tw`ml-auto h-6 bg-blue-600 text-white border-blue-600 disabled:bg-blue-200 disabled:cursor-default disabled:border-blue-200`,
  ]};
`;

export const threadCancelButtonCss = css`
  ${[
    buttonStyle,
    tw`h-6 bg-red-600 text-white border-red-600 disabled:bg-red-200 disabled:cursor-default disabled:border-red-200`,
  ]};
`;
