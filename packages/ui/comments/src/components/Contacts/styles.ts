import { css } from 'styled-components';
import tw from 'twin.macro';

export const contactsWrapperCss = css`
  ${tw`relative`}
`;

export const contactsRootCss = css`
  ${tw`flex flex-col gap-2 absolute bg-gray-200 rounded-lg`}
`;

export const contactCss = css`
  ${tw`flex gap-2 p-2 items-center cursor-pointer rounded-lg hover:bg-gray-300`}
`;

export const contactsImageCss = css`
  ${tw`h-10 w-10 object-cover rounded-full rounded-full`};
`;

export const contactsNameCss = css`
  ${tw`p-0 m-0 text-gray-900`};
`;

export const contactsEmailCss = css`
  ${tw`p-0 m-0 text-sm text-gray-700`};
`;
