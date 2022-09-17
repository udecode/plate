import { css } from 'styled-components';
import tw from 'twin.macro';

export const contactAvatarImageCss = css`
  ${tw`rounded-full font-normal text-left text-black text-sm cursor-default whitespace-nowrap h-10 w-10`};
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
  direction: ltr;
  -webkit-user-select: text;
`;
