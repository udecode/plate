import { createStyles, StyledProps } from '@udecode/plate-styled-components';
import { css } from 'styled-components';

export function createMoreButtonStyles(props: StyledProps) {
  return createStyles(
    {
      prefixClassNames: 'ThreadMoreButton',
      ...props,
    },
    {
      root: css`
        padding: 3px;
        width: 30px;
        height: 30px;

        & .mdc-icon-button__ripple::before,
        & .mdc-icon-button__ripple::after {
          border-radius: initial;
        }

        svg {
          position: relative;
          top: -3px;
        }
      `,
    }
  );
}
