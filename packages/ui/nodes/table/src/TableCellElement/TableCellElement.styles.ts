import { Value } from '@udecode/plate-core';
import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { TableCellElementStyleProps } from './TableCellElement.types';

export const getTableCellElementStyles = <V extends Value>(
  props: TableCellElementStyleProps<V>
) => {
  const { hovered, selected, hideBorder, readOnly } = props;

  return createStyles(
    { prefixClassNames: 'TableCellElement', ...props },
    {
      root: [
        tw`relative p-0 overflow-visible bg-white`,
        hideBorder
          ? tw`border-none`
          : tw`border-t border-l border-b-0 border-r-0 border-gray-300`,
        selected && tw`border border-blue-500`,
        css`
          min-width: 48px;
        `,
      ],
      content: tw`relative px-3 py-2 z-10 h-full box-border`,
      resizableWrapper: [
        tw`absolute w-full h-full top-0`,
        selected && tw`hidden`,
      ],
      selectedCell: [
        !selected && tw`hidden`,
        tw`absolute top-0 left-0 w-full h-full pointer-events-none`,
        selected &&
          css`
            z-index: 12;
            background-color: rgb(179, 212, 255);
            opacity: 0.3;
          `,
      ],
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
