import React from 'react';
import {
  TableElement,
  TableElementRootProps,
  useTableElementState,
} from '@udecode/plate-table';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { PlateTablePopover } from './PlateTablePopover';

export const PlateTableElement = (props: TableElementRootProps) => {
  const { as, children, ...rootProps } = props;

  const {
    colSizes,
    isSelectingCell,
    minColumnWidth,
    marginLeft,
  } = useTableElementState();

  return (
    <PlateTablePopover>
      <TableElement.Wrapper style={{ paddingLeft: marginLeft }}>
        <TableElement.Root
          css={[
            tw`table table-fixed w-full h-px my-4 ml-px mr-0 border-collapse`,
            isSelectingCell &&
              css`
                *::selection {
                  background: none;
                }
              `,
          ]}
          {...rootProps}
        >
          <TableElement.ColGroup>
            {colSizes.map((width, index) => (
              <TableElement.Col
                key={index}
                style={{
                  minWidth: minColumnWidth,
                  width: width || undefined,
                }}
              />
            ))}
          </TableElement.ColGroup>

          <TableElement.TBody css={tw`min-w-full`}>
            {children}
          </TableElement.TBody>
        </TableElement.Root>
      </TableElement.Wrapper>
    </PlateTablePopover>
  );
};
