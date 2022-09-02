import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { ThreadCommentStyleProps } from './ThreadComment.types';

export const getThreadCommentStyles = (props: ThreadCommentStyleProps) => {
  return createStyles(
    {
      prefixClassNames: 'ThreadComment',
      ...props,
    },
    {
      root: [],
      actions: [tw`ml-auto`],
      commentHeader: [
        tw`flex items-center whitespace-nowrap h-9 p-3 mt-2 font-normal text-left text-black text-sm cursor-default`,
      ],
      authorTimestamp: [
        tw`flex flex-col content-center items-start font-normal text-left text-black whitespace-nowrap text-sm ml-3`,
      ],
      commenterName: [
        tw`text-gray-700 text-sm text-left font-medium whitespace-nowrap`,
      ],
      timestamp: [
        tw`text-gray-500 text-xs text-left whitespace-nowrap tracking-wide`,
      ],
      threadCommentText: [tw`text-sm whitespace-pre-wrap px-3 py-2`],
    }
  );
};
