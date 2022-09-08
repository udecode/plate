import { css } from 'styled-components';
import tw from 'twin.macro';

export const avatarRootCss = css`
  ${tw`font-normal h-8 w-8 object-cover rounded-full`};
`;

export const avatarImageCss = css`
  ${tw`w-full h-full rounded-full text-gray-400`};
`;
