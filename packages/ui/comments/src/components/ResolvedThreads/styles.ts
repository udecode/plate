import { css } from 'styled-components';
import tw from 'twin.macro';

export const resolvedThreadsRootCss = css`
  ${tw`bg-white rounded-lg w-64 h-64 flex flex-col border border-solid border-gray-200 overflow-scroll`}

  h2 {
    ${tw`text-center `}
  }
`;

export const resolvedThreadsCss = css`
  ${tw`rounded-lg overflow-scroll`}
`;
