import {
  createStyles,
  StyledElementProps,
} from '@udecode/slate-plugins-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';

export const getBlockquoteElementStyles = (props: StyledElementProps) =>
  createStyles(
    { prefixClassNames: 'BlockquoteElement', ...props },
    {
      root: [
        tw`my-2 mx-0`,
        css`
          border-left: 2px solid #ddd;
          padding: 10px 20px 10px 16px;
          color: #aaa;
        `,
      ],
    }
  );
