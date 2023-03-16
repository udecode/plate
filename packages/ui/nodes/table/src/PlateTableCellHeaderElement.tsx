import React from 'react';
import {
  TableCellElement,
  TableCellElementRoot,
  useTableCellElementState,
} from '@udecode/plate-table';
import { css, CSSProp } from 'styled-components';
import tw from 'twin.macro';
import {
  cssTableCellContent,
  cssTableCellResizable,
  getCssTableCellHandle,
  getCssTableCellRoot,
  PlateTableCellElementProps,
} from './PlateTableCellElement';

export const PlateTableCellHeaderElement = (
  props: PlateTableCellElementProps
) => {
  const { as, children, hideBorder, ...rootProps } = props;

  const {
    colIndex,
    rowIndex,
    readOnly,
    selected,
    hovered,
    rowSize,
    borders,
  } = useTableCellElementState();

  return (
    <TableCellElementRoot
      asAlias="th"
      css={[
        ...(getCssTableCellRoot({
          borders,
          hideBorder,
          selected,
        }) as CSSProp[]),
        tw`text-left`,
        css`
          ::before {
            background-color: rgb(244, 245, 247);
          }

          > * {
            margin: 0;
          }
        `,
      ]}
      {...rootProps}
    >
      <TableCellElement.Content
        css={cssTableCellContent}
        style={{
          minHeight: rowSize,
        }}
      >
        {children}
      </TableCellElement.Content>

      <TableCellElement.ResizableWrapper
        css={cssTableCellResizable}
        className="group"
      >
        <TableCellElement.Resizable
          colIndex={colIndex}
          rowIndex={rowIndex}
          readOnly={readOnly}
        />

        <TableCellElement.Handle
          css={getCssTableCellHandle({ readOnly, hovered })}
        />
      </TableCellElement.ResizableWrapper>
    </TableCellElementRoot>
  );
};
