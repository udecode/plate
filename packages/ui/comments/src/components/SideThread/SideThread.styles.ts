import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { SideThreadStyleProps } from './SideThread.types';

export const getSideThreadStyles = (props: SideThreadStyleProps) =>
  createStyles(
    {
      prefixClassNames: 'SideThread',
      ...props,
    },
    {
      root: [tw`absolute pb-4 w-96 z-10`],
    }
  );
