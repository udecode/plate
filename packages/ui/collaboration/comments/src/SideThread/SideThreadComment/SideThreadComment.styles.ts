import { createStyles, StyledProps } from '@udecode/plate-styled-components';
import { css } from 'styled-components';

export function createSideThreadCommentStyled(props: StyledProps) {
  return createStyles(
    {
      prefixClassNames: 'SideThreadComment',
      ...props,
    },
    {
      root: css``,
    }
  );
}

export function createResolveThreadButtonStyles(props: StyledProps) {
  return createStyles(
    {
      prefixClassNames: 'SideThreadResolveThreadButton',
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

export function createSideThreadCommentTextStyles(props: StyledProps) {
  return createStyles(
    {
      prefixClassNames: 'SideThreadCommentText',
      ...props,
    },
    {
      root: css`
        padding-left: 12px;
        padding-right: 12px;
        font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
      `,
    }
  );
}
