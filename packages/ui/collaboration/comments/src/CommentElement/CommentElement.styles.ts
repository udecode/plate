import {
  createStyles,
  StyledElementProps,
} from '@udecode/plate-styled-components';
import { css } from 'styled-components';

export const getCommentElementStyles = (props: StyledElementProps) =>
  createStyles(
    { prefixClassNames: 'CommentElement', ...props },
    {
      root: css`
        background-color: #fee9ae;
      `,
    }
  );

// active color: #fcc934
