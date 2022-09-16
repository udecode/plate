import { css } from 'styled-components';
import tw from 'twin.macro';

export const sideThreadRootCss = css`
  ${tw`absolute pb-4 w-96 z-10`}
  box-shadow: 0 0 12px #ccc;
`;

export const sideThreadRootWrapperCss = css`
  ${tw`relative`}
`;
