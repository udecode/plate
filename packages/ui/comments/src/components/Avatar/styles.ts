import { css } from 'styled-components';
import tw from 'twin.macro';

export const avatarRootCss = css`
  ${tw`font-normal text-left text-black text-sm cursor-default whitespace-nowrap w-8 h-8 object-cover left-0 block relative rounded-full`};
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  direction: ltr;
  user-select: text;
  aspect-ratio: auto 32 / 32;
`;

export const avatarImageCss = css`
  ${tw`rounded-full font-normal text-left text-black text-sm cursor-default whitespace-nowrap h-8 w-8`}
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  direction: ltr;
  user-select: text;
`;

export const avatarAccountCircleCss = css`
  ${tw`font-normal text-left text-gray-500 text-sm cursor-default whitespace-nowrap h-8 w-8`};
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  direction: ltr;
  user-select: text;
`;
