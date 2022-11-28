import { css } from 'styled-components';
import tw from 'twin.macro';

export const resolvedCommentsRootCss = css`
  ${tw`w-[500px]`}
`;

export const resolvedCommentsHeaderCss = css`
  ${tw`p-4 flex-none font-medium text-base mt-0 mb-0`};
  border-bottom: 1px solid rgb(218, 220, 224);
`;

export const resolvedCommentsBodyCss = css`
  ${tw`p-4 overflow-y-auto flex-auto`};

  & > * {
    ${tw`mb-4`};
  }

  & > *:last-child {
    ${tw`mb-0`};
  }
`;
