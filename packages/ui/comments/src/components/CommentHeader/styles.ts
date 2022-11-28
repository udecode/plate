import { css } from 'styled-components';
import tw from 'twin.macro';

export const userHeaderRootCss = css`
  ${tw`flex flex-row items-center p-3 rounded-t-lg`};
  border-bottom: 1px solid rgb(218, 220, 224);
`;

export const userHeaderAvatarContainerCss = css`
  ${tw`mr-2 bg-white w-8 h-8 flex-none rounded-full`};
`;

export const userHeaderAssignedToContainerCss = css`
  ${tw`flex-auto`}
`;

export const userHeaderAssignedToTextCss = css`
  ${tw`text-xs`};
`;

export const commentUserCss = css`
  ${tw`text-sm leading-5 font-medium`};
`;

export const userHeaderActionsCss = css`
  ${tw`flex-none`};
`;
