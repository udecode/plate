import { css } from 'styled-components';
import tw from 'twin.macro';

export const resolvedThreadsRootCss = css`
  ${tw`bg-white rounded-lg w-[24rem] h-[24rem] absolute flex flex-col`};
  box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px 0px;
`;

export const resolvedThreadsHeaderCss = css`
  ${tw`p-4 flex-none`};
  border-bottom: 1px solid rgb(218, 220, 224);

  h2 {
    ${tw`font-medium text-base mt-0 mb-0`};
    font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
  }
`;

export const resolvedThreadsBodyCss = css`
  ${tw`p-4 overflow-y-auto flex-auto`};

  & > * {
    ${tw`mb-4`};
  }

  & > *:last-child {
    ${tw`mb-0`};
  }
`;
