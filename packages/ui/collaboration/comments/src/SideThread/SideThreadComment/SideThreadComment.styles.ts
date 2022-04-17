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
