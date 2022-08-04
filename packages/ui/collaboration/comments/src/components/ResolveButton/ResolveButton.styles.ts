import { createStyles, StyledProps } from '@udecode/plate-styled-components';
import { css, CSSProp } from 'styled-components';

export type ResolveButtonStyledProps = StyledProps<{
  icon: CSSProp;
}>;

export const createResolveButtonStyles = (props: ResolveButtonStyledProps) =>
  createStyles(
    {
      prefixClassNames: 'ResolveButton',
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
        color: #2196f3;
      `,
    }
  );
