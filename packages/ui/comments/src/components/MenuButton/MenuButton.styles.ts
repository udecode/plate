import { createStyles, StyledProps } from '@udecode/plate-styled-components';
import tw from 'twin.macro';

export const getMenuButtonStyles = (props: StyledProps) => {
  return createStyles(
    {
      prefixClassNames: 'MenuButton',
      ...props,
    },
    {
      root: [tw`p-1 w-8 h-8`],
    }
  );
};
