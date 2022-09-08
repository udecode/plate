import { css } from 'styled-components';
import tw from 'twin.macro';

export const moreMenuRootStyles = css`
  ${tw`relative`}
`;

export const moreMenuButtonRootStyles = css`
  ${tw`flex items-center content-center p-1 w-8 h-8 bg-transparent border-none cursor-pointer rounded-lg bg-gray-200 hover:bg-gray-300`}
`;

export const moreMenuMenuRootStyles = css`
  ${tw`bg-gray-200 rounded-lg min-w-[80px] max-w-max absolute top-full mt-1`}
`;

export const moreMenuMenuItemStyles = css`
  ${tw`rounded-lg p-2 cursor-pointer select-none hover:bg-gray-300`}
`;
