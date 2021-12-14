import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';

export const getColorsStyles = () =>
  createStyles(
    { prefixClassNames: 'Colors' },
    {
      root: [
        css`
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 0.25rem;
        `,
      ],
    }
  );
