import {
  createStyles,
  StyledElementProps,
} from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { TableElementStyleProps } from './TableElement.types';

export const getTableElementStyles = (props: TableElementStyleProps) =>
  createStyles(
    { prefixClassNames: 'TableElement', ...props },
    {
      root: [
        tw`table w-full my-4 mx-0 border-collapse`,
        css`
          min-width: 400px;
        `,
      ],
      tbody: [tw`min-w-full`],
    }
  );
