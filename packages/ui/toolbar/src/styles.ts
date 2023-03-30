import { plateButtonCss } from '@udecode/plate-ui-button';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';

export const floatingRootCss = css`
  ${tw`bg-white !z-40 w-auto`};

  border-radius: 4px;
  box-shadow: rgb(15 15 15 / 5%) 0 0 0 1px, rgb(15 15 15 / 10%) 0 3px 6px,
    rgb(15 15 15 / 20%) 0 9px 24px;
`;

export const floatingRowCss = css`
  ${tw`px-2 py-1 flex flex-row items-center`};
`;

export const floatingButtonCss = [...plateButtonCss, tw`px-1`];

export const FloatingIconWrapper = styled.div`
  ${tw`flex items-center px-2 text-gray-400`};
`;

export const FloatingInputWrapper = styled.div`
  ${tw`flex items-center py-1 pr-2`};
`;

export const floatingInputCss = [
  tw`border-none bg-transparent h-8 flex-grow p-0`,
  tw`focus:outline-none`,
  css`
    line-height: 20px;
  `,
];
