import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { TableElementStyleProps } from './TableElement.types';

export const getTableElementStyles = (props: TableElementStyleProps) =>
  createStyles(
    { prefixClassNames: 'TableElement', ...props },
    {
      root: tw`table w-full my-4 mx-0 border-collapse`,
      tbody: tw`min-w-full`,
    }
  );
