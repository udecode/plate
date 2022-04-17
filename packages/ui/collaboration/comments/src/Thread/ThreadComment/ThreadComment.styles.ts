import { createStyles, StyledProps } from '@udecode/plate-styled-components';
import { css } from 'styled-components';

export function createThreadCommentStyled(props: StyledProps) {
  return createStyles(
    {
      prefixClassNames: 'ThreadComment',
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
      prefixClassNames: 'ThreadResolveThreadButton',
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

export function createReOpenThreadButtonStyles(props: StyledProps) {
  return createStyles(
    {
      prefixClassNames: 'ThreadResolveThreadButton',
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

export function createThreadCommentTextStyles(props: StyledProps) {
  return createStyles(
    {
      prefixClassNames: 'ThreadCommentText',
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
