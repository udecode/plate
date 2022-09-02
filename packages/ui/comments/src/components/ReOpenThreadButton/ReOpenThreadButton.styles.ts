import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { ReOpenThreadButtonStyleProps } from './ReOpenThreadButton.types';

export const getReOpenThreadButtonStyles = (
  props: ReOpenThreadButtonStyleProps
) => {
  return createStyles(
    {
      prefixClassNames: 'ReOpenThreadButton',
      ...props,
    },
    {
      root: [tw`flex items-center content-center p-1 w-8 h-8`],
      icon: [tw`text-white`],
    }
  );
};
