import { css } from 'styled-components';
import tw from 'twin.macro';

export const avatarRootCss = css`
  font-weight: normal;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  text-align: left;
  color: black;
  font-size: 14px;
  direction: ltr;
  cursor: default;
  -webkit-user-select: text;
  white-space: nowrap;
  width: 32px;
  aspect-ratio: auto 32 / 32;
  height: 32px;
  object-fit: cover;
  left: 0 !important;
  display: block;
  position: relative;
  border-radius: 50%;
`;

export const avatarImageCss = css`
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
  height: 32px;
  width: 32px;
`;

export const avatarAccountCircleCss = css`
  font-weight: normal;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  text-align: left;
  color: #9e9e9e;
  font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
  font-size: 14px;
  direction: ltr;
  cursor: default;
  -webkit-user-select: text;
  white-space: nowrap;
  height: 32px;
  width: 32px;
`;
