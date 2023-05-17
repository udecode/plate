import React from 'react';
import {
  BorderStylesDefault,
  TableCellElement,
  TableCellElementRootProps,
  useTableCellElementState,
} from '@udecode/plate-table';
import { css, CSSProp } from 'styled-components';
import tw from 'twin.macro';

export interface PlateTableCellElementProps extends TableCellElementRootProps {
  hideBorder?: boolean;
  isHeader?: boolean;
}

export const getCssTableCellRoot = ({
  hideBorder,
  isHeader,
  selected,
  borders,
}: {
  hideBorder?: boolean;
  isHeader?: boolean;
  selected?: boolean;
  borders?: BorderStylesDefault;
} = {}): CSSProp => [
  tw`relative p-0 overflow-visible bg-white border-none`,
  hideBorder && tw`before:border-none`,
  !hideBorder && [
    tw`before:content-[''] before:box-border before:absolute before:select-none`,
    borders && [
      borders.bottom &&
        css`
          ::before {
            border-bottom: ${borders.bottom.size}px ${borders.bottom.style}
              ${borders.bottom.color};
          }
        `,
      borders.right &&
        css`
          ::before {
            border-right: ${borders.right.size}px ${borders.right.style}
              ${borders.right.color};
          }
        `,
      borders.left &&
        css`
          ::before {
            border-left: ${borders.left.size}px ${borders.left.style}
              ${borders.left.color};
          }
        `,
      borders.top &&
        css`
          ::before {
            border-top: ${borders.top.size}px ${borders.top.style}
              ${borders.top.color};
          }
        `,
    ],
  ],
  isHeader && tw`text-left`,
  isHeader &&
    css`
      ::before {
        background-color: rgb(244, 245, 247);
      }

      > * {
        margin: 0;
      }
    `,
  tw`before:w-full before:h-full`,
  selected && tw`before:border-blue-500 before:z-10 before:bg-blue-50`,
];

export const cssTableCellContent: CSSProp = [
  tw`relative h-full px-3 py-2 z-20 box-border`,
];

export const cssTableCellResizable: CSSProp = [
  tw`absolute w-full h-full top-0 select-none`,
];

export const getCssTableCellHandle = ({ side }: { side: 'left' | 'right' }) => [
  tw`absolute z-30 w-1 bg-blue-500`,
  css`
    top: -12px;
    ${side}: -1.5px;

    height: calc(100% + 12px);
  `,
];

export const PlateTableCellElement = (props: PlateTableCellElementProps) => {
  const { children, hideBorder, isHeader, ...rootProps } = props;

  const {
    colIndex,
    rowIndex,
    readOnly,
    selected,
    hovered,
    hoveredLeft,
    rowSize,
    borders,
  } = useTableCellElementState();

  // const [openDropdown, setOpenDropdown] = useState(false);

  return (
    <TableCellElement.Root
      asAlias={isHeader ? 'th' : 'td'}
      css={getCssTableCellRoot({ borders, hideBorder, isHeader, selected })}
      {...rootProps}
    >
      {/* <div css={[tw`absolute top-0 right-2 z-30`]} contentEditable={false}> */}
      {/*  <Popover */}
      {/*    floatingOptions={{ */}
      {/*      open: openDropdown, */}
      {/*      placement: 'top-end', */}
      {/*      middleware: [ */}
      {/*        offset(0), */}
      {/*        flip({ */}
      {/*          padding: 0, */}
      {/*        }), */}
      {/*        shift(), */}
      {/*      ], */}
      {/*    }} */}
      {/*    content={ */}
      {/*      <div css={tw`min-w-[140px]`}> */}
      {/*        <PlateButton>Bottom Border</PlateButton> */}
      {/*        <PlateButton>Top Border</PlateButton> */}
      {/*        <PlateButton>Left Border</PlateButton> */}
      {/*        <PlateButton>Right Border</PlateButton> */}
      {/*      </div> */}
      {/*    } */}
      {/*    css={floatingRootCss} */}
      {/*  > */}
      {/*    <div> */}
      {/*      <PlateButton */}
      {/*        className="h-[13px] w-[13px] p-0" */}
      {/*        onClick={() => setOpenDropdown(!openDropdown)} */}
      {/*      > */}
      {/*        <ArrowDropDownCircleIcon */}
      {/*          className="block my-0 mx-auto absolute text-gray-300" */}
      {/*          height={16} */}
      {/*          width={16} */}
      {/*        /> */}
      {/*      </PlateButton> */}
      {/*    </div> */}
      {/*  </Popover> */}
      {/* </div> */}

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

        {!readOnly && hovered && (
          <TableCellElement.Handle
            css={getCssTableCellHandle({ side: 'right' })}
          />
        )}

        {!readOnly && hoveredLeft && (
          <TableCellElement.Handle
            css={getCssTableCellHandle({ side: 'left' })}
          />
        )}
      </TableCellElement.ResizableWrapper>
    </TableCellElement.Root>
  );
};
