import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { TableCellElementStyleProps } from './TableCellElement.types';

export const getTableCellElementStyles = (
  props: TableCellElementStyleProps
) => {
  const { hovered } = props;

  return createStyles(
    { prefixClassNames: 'TableCellElement', ...props },
    {
      root: [
        tw`relative p-0 overflow-visible`,
        css`
          background-color: rgb(255, 255, 255);
          border: 1px solid rgb(193, 199, 208);
          min-width: 48px;

          > * {
            margin: 0;
          }
        `,
      ],
      content: tw`relative px-3 py-2 z-10`,
      resizableWrapper: [tw`absolute w-full h-full top-0`],
      handle: [
        tw`absolute`,
        hovered && tw`bg-blue-500`,
        css`
          right: -2px;
          top: -12px;
          height: calc(100% + 12px);

          width: 4px;
          z-index: 10;
        `,
      ],
    }
  );
};
