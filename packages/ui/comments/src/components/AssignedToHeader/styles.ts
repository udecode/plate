import { css } from 'styled-components';
import tw from 'twin.macro';

export const assignedToHeaderRootCss = css`
  ${tw`flex flex-row items-center p-3 rounded-t-lg`};
  border-bottom: 1px solid rgb(218, 220, 224);
`;

export const assignedToHeaderAvatarContainerCss = css`
  ${tw`mr-2 bg-white w-8 h-8 flex-none rounded-full`};
`;

export const assignedToHeaderAssignedToContainerCss = css`
  ${tw`flex-auto`}
`;

export const assignedToHeaderAssignedToTextCss = css`
  ${tw`text-xs`};
  font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
`;

export const assignedToHeaderAssignedToUserNameCss = css`
  ${tw`text-sm leading-5 font-medium`};
  font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
`;

export const assignedToHeaderActionsCss = css`
  ${tw`flex-none`};
`;
