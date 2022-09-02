import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { ResolveButtonStyleProps } from './ResolveButton.types';

export const createResolveButtonStyles = (props: ResolveButtonStyleProps) => {
  return createStyles(
    {
      prefixClassNames: 'ResolveButton',
      ...props,
    },
    {
      root: [tw`flex items-center content-center p-1 w-8 h-8`],
    }
  );
};
