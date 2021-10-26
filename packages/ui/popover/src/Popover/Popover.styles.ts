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
          box-shadow: rgba(9, 30, 66, 0.31) 0 0 1px,
            rgba(9, 30, 66, 0.25) 0 4px 8px -2px;
        `,
      ],
    }
  );
