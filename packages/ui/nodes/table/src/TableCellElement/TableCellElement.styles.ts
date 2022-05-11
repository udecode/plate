import { Value } from '@udecode/plate-core';
import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { TableCellElementStyleProps } from './TableCellElement.types';

export const getTableCellElementStyles = <V extends Value>(
  props: TableCellElementStyleProps<V>
) => {
  const { hovered, hideBorder, readOnly } = props;

  return createStyles(
    { prefixClassNames: 'TableCellElement', ...props },
    {
      root: [
        tw`relative p-0 overflow-visible bg-white`,
        hideBorder ? tw`border-none` : tw`border border-gray-300`,
        css`
          min-width: 48px;
        `,
      ],
      content: tw`relative px-3 py-2 z-10`,
      resizableWrapper: [tw`absolute w-full h-full top-0`],
      handle: [
        tw`absolute`,
        !readOnly && hovered && tw`bg-blue-500`,
        css`
          top: -12px;
          right: -2px;

          width: 4px;
          height: calc(100% + 12px);

          z-index: 10;
        `,
      ],
    }
  );
};
