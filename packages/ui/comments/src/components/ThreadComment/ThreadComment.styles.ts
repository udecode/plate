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
        white-space: pre-wrap;
      `,
    }
  );
}
