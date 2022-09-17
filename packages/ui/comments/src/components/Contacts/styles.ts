import { css } from 'styled-components';
import tw from 'twin.macro';

export const contactAvatarImageCss = css`
  ${tw`rounded-full`}
  font-weight: normal;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  text-align: left;
  color: black;
  font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
  font-size: 14px;
  direction: ltr;
  cursor: default;
  -webkit-user-select: text;
  white-space: nowrap;
  height: 40px;
  width: 40px;
`;
