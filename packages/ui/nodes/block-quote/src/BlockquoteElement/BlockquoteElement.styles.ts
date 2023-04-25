import { Value } from '@udecode/plate-common';
import {
  createStyles,
  StyledElementProps,
} from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';

export const getBlockquoteElementStyles = <V extends Value>(
  props: StyledElementProps<V>
) =>
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
