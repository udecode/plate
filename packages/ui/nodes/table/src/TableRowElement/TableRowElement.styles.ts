import { Value } from '@udecode/plate-core';
import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { TableRowElementStyleProps } from './TableRowElement.types';

export const getTableRowElementStyles = <V extends Value>(
  props: TableRowElementStyleProps<V>
) =>
  createStyles(
    { prefixClassNames: 'TableRowElement', ...props },
    {
      root: [props.hideBorder && tw`border-none`],
    }
  );
