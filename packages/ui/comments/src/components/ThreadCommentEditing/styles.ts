import { css } from 'styled-components';
import tw from 'twin.macro';

export const threadCommentEditingRootCss = css`
  ${tw`font-normal text-black whitespace-normal text-sm cursor-default relative bg-white p-3 block pt-0 text-left`}
`;

export const threadCommentEditingActionsCss = css`
  ${tw`flex gap-2 font-normal text-black whitespace-normal text-sm text-left pt-2 ml-auto mr-4 w-min`};
`;

const buttonStyle = tw`relative inline-block text-center border whitespace-nowrap outline-none align-middle rounded shadow-none box-border font-medium text-sm leading-4 select-none cursor-pointer px-4 w-20`;

export const threadCommentEditingSaveButtonCss = css`
  ${[
    buttonStyle,
    tw`h-6 bg-blue-600 text-white border-blue-600 disabled:bg-blue-200 disabled:cursor-default disabled:border-blue-200`,
  ]};
`;

export const threadCommentEditingCancelButtonCss = css`
  ${[
    buttonStyle,
    tw`bg-white h-6 text-red-600 box-border border border-red-600`,
  ]}
`;
