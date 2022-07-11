import { createStyles, StyledProps } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';

export const getPopoverStyles = (props: StyledProps) =>
  createStyles(
    { prefixClassNames: 'Popover', ...props },
    {
      root: [
        tw`flex px-2 py-1 bg-white outline-none`,
        css`
          border-radius: 3px;
          max-width: 350px;
          font-size: 14px;
          box-shadow: rgb(15 15 15 / 5%) 0 0 0 1px,
            rgb(15 15 15 / 10%) 0 3px 6px, rgb(15 15 15 / 20%) 0 9px 24px;
        `,
      ],
    }
  );
