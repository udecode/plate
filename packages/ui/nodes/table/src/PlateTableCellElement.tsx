import React from 'react';
import {
  TableCellElement,
  TableCellElementRootProps,
  useTableCellElementState,
} from '@udecode/plate-table';
import { PlateButton } from '@udecode/plate-ui-button';
import { css } from 'styled-components';
import tw from 'twin.macro';

export interface PlateTableCellElementProps extends TableCellElementRootProps {
  hideBorder?: boolean;
}

export const PlateTableCellElement = (props: PlateTableCellElementProps) => {
  const { as, children, hideBorder, ...rootProps } = props;

  const { colIndex, readOnly, selected, hovered } = useTableCellElementState();

  return (
    <TableCellElement.Root
      css={[
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
      ]}
      {...rootProps}
    >
      <div css={[tw`absolute top-0 right-0 z-30`]}>
        <PlateButton>a</PlateButton>
      </div>

      <TableCellElement.Content
        css={[tw`relative px-3 py-2 z-20 h-full box-border`]}
      >
        {children}
      </TableCellElement.Content>

      <TableCellElement.ResizableWrapper
        css={[tw`absolute w-full h-full top-0 select-none`]}
        className="group"
        colIndex={colIndex}
      >
        <TableCellElement.Resizable colIndex={colIndex} readOnly={readOnly} />

        <TableCellElement.Handle
          css={[
            tw`absolute z-30 w-1`,
            !readOnly && hovered && tw`bg-blue-500`,
            css`
              top: -12px;
              right: -1.5px;

              height: calc(100% + 12px);
            `,
          ]}
        />
      </TableCellElement.ResizableWrapper>
    </TableCellElement.Root>
  );
};
