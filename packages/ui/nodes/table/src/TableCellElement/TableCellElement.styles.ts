import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { PlateTableCellElementProps } from './PlateTableCellElement';

export interface TableCellElementStyleProps extends PlateTableCellElementProps {
  hovered: boolean;
  selected?: boolean;
  readOnly: boolean;
}

export const getTableCellElementStyles = (
  props: TableCellElementStyleProps
) => {
  const { hovered, selected, hideBorder, readOnly } = props;

  return createStyles(
    { prefixClassNames: 'TableCellElement', ...props },
    {
      root: [
        tw`relative p-0 overflow-visible bg-white border-none`,
        hideBorder
          ? tw`before:border-none`
          : tw`before:content-[''] before:box-border before:absolute before:-top-px before:-left-px before:border before:border-solid before:select-none before:border-gray-300`,
        selected && tw`before:border-blue-500 before:z-10 before:bg-blue-50`,
        css`
          ::before {
            width: calc(100% + 1px);
            height: calc(100% + 1px);
          }
        `,
      ],
      content: [tw`relative px-3 py-2 z-20 h-full box-border`],
      resizableWrapper: [tw`absolute w-full h-full top-0 select-none`],
      handle: [
        tw`absolute z-30 w-1`,
        !readOnly && hovered && tw`bg-blue-500`,
        css`
          top: -12px;
          right: -1.5px;

          height: calc(100% + 12px);
        `,
      ],
    }
  );
};
