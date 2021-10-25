import { createStyles, StyledProps } from '@udecode/plate-styled-components';
import { getButtonStyles } from '@udecode/plate-ui-button';
import tw from 'twin.macro';
import { MenuButtonStyles } from './MenuButton.types';

export const getMenuButtonStyles = (props: StyledProps<MenuButtonStyles>) => {
  const { root } = getButtonStyles(props);

  return createStyles(
    { prefixClassNames: 'MenuButton', ...props },
    {
      root: [...root.css],
      chevron: tw`ml-1`,
    }
  );
};
