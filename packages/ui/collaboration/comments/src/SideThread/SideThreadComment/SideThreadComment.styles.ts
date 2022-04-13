import { createStyles, StyledProps } from '@udecode/plate-styled-components';
import { css } from 'styled-components';

export function getSideThreadCommentStyled(props: StyledProps) {
  return createStyles(
    {
      prefixClassNames: 'SideThreadComment',
      ...props,
    },
    {
      root: css`
        padding-left: 12px;
        padding-right: 12px;
      `,
    }
  );
}
