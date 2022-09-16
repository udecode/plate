import { css } from 'styled-components';
import tw from 'twin.macro';

export const assignedToHeaderRoot = css`
  ${tw`flex items-center justify-between bg-[#56bf98]	rounded-t-lg px-3 py-1`}
`;

export const assignedToHeaderInformationCss = css`
  ${tw`flex items-center gap-2 text-white`}
`;

export const assignedToHeaderAvatarCss = css`
  ${tw`h-8 w-8 object-cover rounded-full`};
`;

export const assignedToHeaderActionsCss = css`
  ${tw`flex items-center gap-2`};
`;

export const assignedToHeaderResolveButtonCss = css`
  ${tw`flex items-center content-center p-1 w-8 h-8 bg-transparent border-none cursor-pointer rounded-lg bg-gray-200 hover:bg-gray-300`}
`;

export const assignedToHeaderReOpenThreadButtonCss = css`
  ${tw`flex items-center content-center p-1 w-8 h-8 bg-transparent border-none cursor-pointer rounded-lg bg-gray-200 hover:bg-gray-300`}
`;
