import {
  createStyles,
  StyledElementProps,
  StyledProps,
} from '@udecode/plate-styled-components';
import { css, CSSProp } from 'styled-components';

export const createThreadElementStyles = (props: StyledElementProps) =>
  createStyles<StyledProps<{ selected: CSSProp; resolved: CSSProp }>>(
    {
      prefixClassNames: 'ThreadElement',
      ...props,
    } as any,
    {
      root: css`
        background-color: #fee9ae;
      `,
      selected: css`
        background-color: #fcc934;
      `,
      resolved: css`
        background-color: initial !important;
      `,
    }
  );
