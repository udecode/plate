import { createStyles, StyledProps } from '@udecode/plate-styled-components';
import { css } from 'styled-components';

export const createCloseButtonStyles = (props: StyledProps) =>
  createStyles(
    {
      prefixClassNames: 'ThreadLinkDialogCloseButton',
      ...props,
    },
    {
      root: css`
        width: 32px;
        height: 32px;
        padding: 7px;

        svg {
          position: relative;
          top: -6px;
          width: 18px;
          height: 18px;
        }
      `,
    }
  );
