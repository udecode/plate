import React, { useState } from 'react';
import { flip, offset, shift } from '@floating-ui/react-dom-interactions';
import { Popover } from '@udecode/plate-floating';
import {
  ArrowDropDownCircleIcon,
  TableCellElement,
  TableCellElementRootProps,
  useTableCellElementState,
} from '@udecode/plate-table';
import { PlateButton } from '@udecode/plate-ui-button';
import { floatingRootCss } from '@udecode/plate-ui-toolbar';
import { css } from 'styled-components';
import tw from 'twin.macro';

export interface PlateTableCellElementProps extends TableCellElementRootProps {
  hideBorder?: boolean;
}

export const PlateTableCellElement = (props: PlateTableCellElementProps) => {
  const { as, children, hideBorder, ...rootProps } = props;

  const {
    colIndex,
    readOnly,
    selected,
    hovered,
    rowSize,
    isLastCell,
    isLastRow,
  } = useTableCellElementState();

  const [openDropdown, setOpenDropdown] = useState(false);

  return (
    <TableCellElement.Root
      css={[
        tw`relative p-0 overflow-visible bg-white border-none`,
        hideBorder && tw`before:border-none`,
        !hideBorder &&
          tw`before:content-[''] before:box-border before:absolute before:-top-px before:-left-px before:select-none before:border before:border-solid before:border-gray-300`,
        !hideBorder &&
          !isLastCell &&
          css`
            ::before {
              border-right: none;
            }
          `,
        !hideBorder &&
          !isLastRow &&
          css`
            ::before {
              border-bottom: none;
            }
          `,
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
      <div css={[tw`absolute top-0 right-2 z-30`]} contentEditable={false}>
        <Popover
          floatingOptions={{
            open: openDropdown,
            placement: 'top-end',
            middleware: [
              offset(0),
              flip({
                padding: 0,
              }),
              shift(),
            ],
          }}
          content={
            <div css={tw`min-w-[140px]`}>
              <PlateButton>Bottom Border</PlateButton>
              <PlateButton>Top Border</PlateButton>
              <PlateButton>Left Border</PlateButton>
              <PlateButton>Right Border</PlateButton>
            </div>
          }
          css={floatingRootCss}
        >
          <div>
            <PlateButton
              tw="h-[13px] w-[13px] p-0"
              onClick={() => setOpenDropdown(!openDropdown)}
            >
              <ArrowDropDownCircleIcon
                tw="block my-0 mx-auto absolute text-gray-300"
                height={16}
                width={16}
              />
            </PlateButton>
          </div>
        </Popover>
      </div>

      <TableCellElement.Content
        css={[tw`relative h-full px-3 py-2 z-20 box-border`]}
        style={{
          minHeight: rowSize,
        }}
      >
        {children}
      </TableCellElement.Content>

      <TableCellElement.ResizableWrapper
        css={[tw`absolute w-full h-full top-0 select-none`]}
        className="group"
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
