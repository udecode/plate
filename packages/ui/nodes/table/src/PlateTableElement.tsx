import React from 'react';
import { getPluginOptions, usePlateEditorRef } from '@udecode/plate-common';
import {
  ELEMENT_TABLE,
  TableElement,
  TableElementRootProps,
  TablePlugin,
  useTableElementState,
} from '@udecode/plate-table';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { PlateTablePopover } from './PlateTablePopover';

export const PlateTableElement = (props: TableElementRootProps) => {
  const { as, children, ...rootProps } = props;

  const editor = usePlateEditorRef();
  const { minColumnWidth: minWidth } = getPluginOptions<TablePlugin>(
    editor,
    ELEMENT_TABLE
  );
  const { colSizes, isSelectingCell } = useTableElementState();

  return (
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
              minWidth,
              width: width || undefined,
            }}
          />
        ))}
      </TableElement.ColGroup>

      <PlateTablePopover>
        <TableElement.TBody css={tw`min-w-full`}>{children}</TableElement.TBody>
      </PlateTablePopover>
    </TableElement.Root>
  );
};
