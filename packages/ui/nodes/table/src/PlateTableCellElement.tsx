import React from 'react';
import { cn } from '@udecode/plate-styled-components';
import {
  TableCellElement,
  TableCellElementRootProps,
  useTableCellElementState,
} from '@udecode/plate-table';

export interface PlateTableCellElementProps extends TableCellElementRootProps {
  hideBorder?: boolean;
  isHeader?: boolean;
}

export function PlateTableCellElement(props: PlateTableCellElementProps) {
  const { children, hideBorder, isHeader, ...rootProps } = props;

  const {
    colIndex,
    rowIndex,
    readOnly,
    selected,
    hovered,
    hoveredLeft,
    rowSize,
    // borders,
  } = useTableCellElementState();

  // const [openDropdown, setOpenDropdown] = useState(false);

  return (
    <TableCellElement.Root
      asAlias={isHeader ? 'th' : 'td'}
      className={cn(
        'relative overflow-visible border-none bg-white p-0',
        hideBorder && 'before:border-none',
        // !hideBorder && [
        //   "before:absolute before:box-border before:select-none before:content-['']",
        //   borders && [
        //     borders.bottom &&
        //       `before:border-b-[${borders.bottom.size}px] before:border-b-[${borders.bottom.style}] before:border-b-[${borders.bottom.color}]`,
        //     borders.right &&
        //       `before:border-r-[${borders.right.size}px] before:border-r-[${borders.right.style}] before:border-r-[${borders.right.color}]`,
        //     borders.left &&
        //       `before:border-l-[${borders.left.size}px] before:border-l-[${borders.left.style}] before:border-l-[${borders.left.color}]`,
        //     borders.top &&
        //       `before:border-t-[${borders.top.size}px] before:border-t-[${borders.top.style}] before:border-t-[${borders.top.color}]`,
        //   ],
        // ],
        isHeader && 'text-left',
        isHeader && 'before:bg-[rgb(244,245,247)] [&_>_*]:m-0',
        'before:h-full before:w-full',
        selected && 'before:z-10 before:border-blue-500 before:bg-blue-50'
      )}
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
        className="relative z-20 box-border h-full px-3 py-2"
        style={{
          minHeight: rowSize,
        }}
      >
        {children}
      </TableCellElement.Content>

      <TableCellElement.ResizableWrapper className="group absolute top-0 h-full w-full select-none">
        <TableCellElement.Resizable
          colIndex={colIndex}
          rowIndex={rowIndex}
          readOnly={readOnly}
        />

        {!readOnly && hovered && (
          <TableCellElement.Handle
            className={cn(
              'absolute -top-3 z-30 h-[calc(100%_+_12px)] w-1 bg-blue-500',
              'right-[-1.5px]'
            )}
          />
        )}

        {!readOnly && hoveredLeft && (
          <TableCellElement.Handle
            className={cn(
              'absolute -top-3 z-30 h-[calc(100%_+_12px)] w-1 bg-blue-500',
              'left-[-1.5px]'
            )}
          />
        )}
      </TableCellElement.ResizableWrapper>
    </TableCellElement.Root>
  );
}
