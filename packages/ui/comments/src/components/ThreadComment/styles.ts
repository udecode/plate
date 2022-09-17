import { css } from 'styled-components';
import tw from 'twin.macro';

export const threadCommentRootCss = css`
  ${tw`py-2`}
`;

export const threadCommentHeaderCss = css`
  ${tw`box-content cursor-default flex items-center h-10 text-sm m-0 p-3 text-left text-black whitespace-nowrap`};
  font-weight: normal;
  font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
  direction: ltr;
`;

export const threadCommentHeaderInfoCss = css`
  ${tw`cursor-pointer flex flex-col justify-center flex-grow text-sm pl-2 text-left text-black truncate`};
  font-weight: normal;
  font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
  direction: ltr;
  align-items: start;
`;

export const threadCommentHeaderCreatedByNameCss = css`
  ${tw`cursor-default self-stretch font-medium h-4 text-sm leading-5 my-0 ml-0 mr-1 text-left tracking-wide truncate`};
  direction: ltr;
  color: rgba(60, 64, 67, 1);
  font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
`;

export const threadCommentHeaderCreatedDateCss = css`
  ${tw`text-xs leading-4 tracking-wide`};
  color: rgba(60, 64, 67, 1);
  font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
`;

export const threadCommentTextCss = css`
  ${tw`px-3 whitespace-pre-wrap`};
  font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
`;
