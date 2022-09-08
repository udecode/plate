import { css } from 'styled-components';
import tw from 'twin.macro';

export const assignedToHeaderRoot = css`
  ${tw`flex items-center justify-between bg-indigo-700	rounded-t-lg px-3 py-1`}
`;

export const assignedToHeaderInformationCss = css`
  ${tw`flex items-center gap-2 text-gray-300`}
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

// root: [
//   tw`flex items-center rounded-t-lg p-3 border-b-2 border-gray-600`,
//   isAssignedToLoggedInUser
//     ? tw`bg-blue-600 text-white`
//     : tw`bg-blue-200 text-gray-400`,
// ],
// avatar: [tw`mr-2`],
// assignedTo: [tw`flex items-center content-center gap-1`],
// assignedToLabel: [tw`text-xs`],
// assignedToDisplayName: [tw`text-sm font-medium`],
// done: [tw`flex items-center content-center ml-auto gap-2`],
