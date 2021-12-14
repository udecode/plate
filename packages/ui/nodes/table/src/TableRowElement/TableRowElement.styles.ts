import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { TableRowElementStyleProps } from './TableRowElement.types';

export const getTableRowElementStyles = (props: TableRowElementStyleProps) =>
  createStyles(
    { prefixClassNames: 'TableRowElement', ...props },
    {
      root: [props.hideBorder && tw`border-none`],
    }
  );
