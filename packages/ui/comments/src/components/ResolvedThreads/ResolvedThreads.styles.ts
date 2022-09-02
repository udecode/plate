import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { ResolvedThreadsStyleProps } from './ResolvedThreads.types';

export const createResolvedThreadsStyles = (props: ResolvedThreadsStyleProps) =>
  createStyles(
    {
      prefixClassNames: 'ResolvedThreads',
      ...props,
    },
    {
      root: [tw`bg-white rounded-lg w-64 h-64 absolute flex flex-col`],
      header: [],
      body: [],
    }
  );
