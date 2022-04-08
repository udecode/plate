import {
  createStyles,
  StyledElementProps,
} from '@udecode/plate-styled-components';
import { StyledProps } from '@udecode/plate-styled-components/src';
import { css, CSSProp } from 'styled-components';

export const getCommentElementStyles = (props: StyledElementProps) =>
  createStyles<StyledProps<{ selected: CSSProp }>>(
    {
      prefixClassNames: 'CommentElement',
      ...props,
    } as any,
    {
      root: css`
        background-color: #fee9ae;
      `,
      selected: css`
        background-color: #fcc934;
      `,
    }
  );
