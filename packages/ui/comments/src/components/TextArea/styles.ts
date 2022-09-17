import { css } from 'styled-components';
import tw from 'twin.macro';

export const textAreaCss = css`
  ${tw`text-gray-800 leading-5 h-10 rounded box-border text-sm p-2 block m-0 overflow-x-hidden overflow-y-hidden resize-none w-full cursor-text`};
  border: 1px solid #dadce0;
  min-height: 36px;
  outline-width: 0;
  text-align: start;
  word-wrap: break-word;
`;
