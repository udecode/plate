import { createStyles, StyledProps } from '@udecode/plate-styled-components';
import { css } from 'styled-components';

export const createSideThreadStyles = (props: StyledProps) =>
  createStyles(
    {
      prefixClassNames: 'SideThread',
      ...props,
    },
    {
      root: css`
        position: absolute;
        z-index: 6;
        width: 418px;
        padding-bottom: 1rem;
      `,
    }
  );
