import { createStyles, StyledProps } from '@udecode/plate-styled-components';
import { css } from 'styled-components';

export const createThreadsStyles = (props: StyledProps) =>
  createStyles(
    {
      prefixClassNames: 'Threads',
      ...props,
    },
    {
      root: css`
        border: 1px solid black;
        background-color: white;
        border-radius: 9px;
        width: 24rem;
        min-height: 24rem;
        position: absolute;
        padding: 0.5rem;
      `,
    }
  );
