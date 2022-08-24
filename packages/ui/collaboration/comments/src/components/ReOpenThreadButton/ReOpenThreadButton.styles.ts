import { createStyles, StyledProps } from '@udecode/plate-styled-components';
import { css, CSSProp } from 'styled-components';

export type ReOpenThreadButtonStyledProps = StyledProps<{
  icon: CSSProp;
}>;

export const createReOpenThreadButtonStyles = (
  props: ReOpenThreadButtonStyledProps
) =>
  createStyles(
    {
      prefixClassNames: 'ReOpenThreadButton',
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
      icon: css`
        color: black;
      `,
    }
  );
