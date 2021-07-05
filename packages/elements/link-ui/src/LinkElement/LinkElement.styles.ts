import { createStyles, StyledElementProps } from '@udecode/slate-plugins-ui';
import { css } from 'styled-components';

export const getLinkElementStyles = (props: StyledElementProps) =>
  createStyles(
    { prefixClassNames: 'LinkElement', ...props },
    {
      root: [
        {
          textDecoration: 'initial',
          color: '#0078d4',
        },
        css`
          :hover,
          :visited:hover {
            color: #004578;
            text-decoration: underline;
          }

          :visited {
            color: #0078d4;
          }
        `,
      ],
    }
  );
