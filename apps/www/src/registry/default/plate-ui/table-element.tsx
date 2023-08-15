import React, { forwardRef, Fragment, useCallback } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { PopoverAnchor, PopoverContentProps } from '@radix-ui/react-popover';
import {
  findNodePath,
  isCollapsed,
  PlateElement,
  PlateElementProps,
  someNode,
  useElement,
  usePlateEditorState,
  useRemoveNodeButton,
} from '@udecode/plate-common';
import {
  ResizeDirection,
  ResizeEvent,
  ResizeHandle,
  ResizeLengthClampOptions,
  ResizeLengthStatic,
} from '@udecode/plate-resizable';
import {
  setTableColSize,
  TTableElement,
  useOverrideColSize,
  useTableBordersDropdownMenuContentState,
  useTableCellsMerge,
  useTableElement,
  useTableElementState,
  useTableStore,
} from '@udecode/plate-table';
import { useReadOnly } from 'slate-react';

import { cn } from '@/lib/utils';
import { Icons, iconVariants } from '@/components/icons';

import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Popover, PopoverContent, popoverVariants } from './popover';
import { Separator } from './separator';

const TableBordersDropdownMenuContent = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>((props, ref) => {
  const {
    getOnSelectTableBorder,
    hasOuterBorders,
    hasBottomBorder,
    hasLeftBorder,
    hasNoBorders,
    hasRightBorder,
    hasTopBorder,
  } = useTableBordersDropdownMenuContentState();

  return (
    <DropdownMenuContent
      ref={ref}
      className={cn('min-w-[220px]')}
      side="right"
      align="start"
      sideOffset={0}
      {...props}
    >
      <DropdownMenuCheckboxItem
        checked={hasBottomBorder}
        onCheckedChange={getOnSelectTableBorder('bottom')}
      >
        <Icons.borderBottom className={iconVariants({ size: 'sm' })} />
        <div>Bottom Border</div>
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={hasTopBorder}
        onCheckedChange={getOnSelectTableBorder('top')}
      >
        <Icons.borderTop className={iconVariants({ size: 'sm' })} />
        <div>Top Border</div>
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={hasLeftBorder}
        onCheckedChange={getOnSelectTableBorder('left')}
      >
        <Icons.borderLeft className={iconVariants({ size: 'sm' })} />
        <div>Left Border</div>
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={hasRightBorder}
        onCheckedChange={getOnSelectTableBorder('right')}
      >
        <Icons.borderRight className={iconVariants({ size: 'sm' })} />
        <div>Right Border</div>
      </DropdownMenuCheckboxItem>

      <Separator />

      <DropdownMenuCheckboxItem
        checked={hasNoBorders}
        onCheckedChange={getOnSelectTableBorder('none')}
      >
        <Icons.borderNone className={iconVariants({ size: 'sm' })} />
        <div>No Border</div>
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={hasOuterBorders}
        onCheckedChange={getOnSelectTableBorder('outer')}
      >
        <Icons.borderAll className={iconVariants({ size: 'sm' })} />
        <div>Outside Borders</div>
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  );
});
TableBordersDropdownMenuContent.displayName = 'TableBordersDropdownMenuContent';

const TableFloatingToolbar = React.forwardRef<
  React.ElementRef<typeof PopoverContent>,
  PopoverContentProps
>(({ children, ...props }, ref) => {
  const element = useElement<TTableElement>();
  const { props: buttonProps } = useRemoveNodeButton({ element });

  const { onMergeCells } = useTableCellsMerge();

  const readOnly = useReadOnly();
  const editor = usePlateEditorState();
  const mergeToolbar =
    !readOnly &&
    someNode(editor, {
      match: (n) => n === element,
    }) &&
    !isCollapsed(editor.selection);

  const bordersToolbar =
    !readOnly &&
    someNode(editor, {
      match: (n) => n === element,
    }) &&
    isCollapsed(editor.selection);

  const mergeContent = mergeToolbar && (
    <Button
      contentEditable={false}
      variant="ghost"
      isMenu
      onClick={onMergeCells}
    >
      <Icons.combine className="mr-2 h-4 w-4" />
      Merge
    </Button>
  );

  const bordersContent = bordersToolbar && (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" isMenu>
            <Icons.borderAll className="mr-2 h-4 w-4" />
            Borders
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuPortal>
          <TableBordersDropdownMenuContent />
        </DropdownMenuPortal>
      </DropdownMenu>

      <Button contentEditable={false} variant="ghost" isMenu {...buttonProps}>
        <Icons.delete className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </>
  );

  return (
    <Popover open={mergeToolbar} modal={false}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      <PopoverContent
        ref={ref}
        className={cn(popoverVariants(), 'flex w-[220px] flex-col gap-1 p-1')}
        onOpenAutoFocus={(e) => e.preventDefault()}
        {...props}
      >
        {mergeContent}
      </PopoverContent>
    </Popover>
  );
});
TableFloatingToolbar.displayName = 'TableFloatingToolbar';

const resizeLengthClampStatic = (
  length: ResizeLengthStatic,
  { min, max }: ResizeLengthClampOptions<ResizeLengthStatic>
): ResizeLengthStatic => {
  if (min !== undefined) {
    length = Math.max(length, min);
  }

  if (max !== undefined) {
    length = Math.min(length, max);
  }

  return length;
};

const roundCellSizeToStep = (size: number, step?: number) => {
  return step ? Math.round(size / step) * step : size;
};


const TableElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  PlateElementProps
>(({ className, children, ...props }, ref) => {
  const { colSizes, isSelectingCell, minColumnWidth, marginLeft } =
    useTableElementState();
  const { props: tableProps, colGroupProps } = useTableElement();

  const editor = props.editor;

  const [hoveredColIndex, setHoveredColIndex] =
    useTableStore().use.hoveredColIndex();



  /* eslint-disable @typescript-eslint/no-shadow */
  const getHandleHoverProps = (colIndex: number) => ({
    onHover: () => {
      if (hoveredColIndex === null) {
        // console.log('set hovered col index', colIndex);
        setHoveredColIndex(colIndex);
      }
    },
    onHoverEnd: () => {
      if (hoveredColIndex === colIndex) {
        // console.log('set hovered col index end', colIndex);
        setHoveredColIndex(null);
      }
    },
  });

  const overrideColSize = useOverrideColSize();

  /* eslint-disable @typescript-eslint/no-shadow */
  const setColSize = useCallback(
    (colIndex: number, width: number) => {
      setTableColSize(
        editor,
        { colIndex, width },
        { at: findNodePath(editor, props.element)! }
      );

      // Prevent flickering
      setTimeout(() => overrideColSize(colIndex, null), 0);
    },
    [editor, overrideColSize, props.element]
  );

  const handleResizeRight = useCallback(
    (
      { initialSize: currentInitial, delta, finished }: ResizeEvent,
      colIndex: number
    ) => {
      const nextInitial = colSizes[colIndex + 1];

      const complement = (width: number) =>
        currentInitial + nextInitial - width;

      // console.log(
      //   'currentInitial',
      //   currentInitial,
      //   'nextInitial',
      //   nextInitial,
      //   'minColumnWidth',
      //   minColumnWidth
      // );

      const currentNew = roundCellSizeToStep(
        resizeLengthClampStatic(currentInitial + delta, {
          min: minColumnWidth,
          max: nextInitial ? complement(minColumnWidth) : undefined,
        })
        // stepX
      );
      // console.log('calc', currentInitial, nextInitial, currentNew);
      const nextNew = nextInitial ? complement(currentNew) : undefined;
      // console.log('currentNew', currentNew, 'nextNew', nextNew);
      const fn = finished ? setColSize : overrideColSize;
      fn(colIndex, currentNew);

      // if (nextNew) fn(colIndex + 1, nextNew);
    },
    [colSizes, minColumnWidth, overrideColSize, setColSize]
  );

  const { realColSizes, width } = colSizes.reduce(
    (acc, cur) => {
      if (Number.isInteger(cur)) {
        acc.width += cur;
        acc.realColSizes.push(cur);
      }
      return acc;
    },
    { width: 0, realColSizes: [] }
  );


  


  const tableColumnResizer = (
    <div style={{ width, display: 'flex' }}>
      {realColSizes.map((width, index) => {
        return (
          <div key={index} style={{ width: width, height: 5 }}>
            <div
              className="group absolute top-0 h-full select-none"
              style={{ width: width }}
              contentEditable={false}
              suppressContentEditableWarning={true}
            >
              <ResizeHandle
                className={cn(
                  'absolute z-30 h-full w-1',
                  'right-[-1.5px]',
                  hoveredColIndex === index && 'bg-ring'
                )}
                options={{
                  direction: 'right' as ResizeDirection,
                  onResize: (resizeEvent) =>
                    handleResizeRight(resizeEvent, index),
                  ...getHandleHoverProps(index),
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <TableFloatingToolbar>
      <div style={{ paddingLeft: marginLeft, position: 'relative' }}>
        {tableColumnResizer}
        <PlateElement
          asChild
          ref={ref}
          className={cn(
            'my-4 ml-px mr-0 table h-px w-full table-fixed border-collapse',
            isSelectingCell && '[&_*::selection]:bg-none',
            className
          )}
          {...tableProps}
          {...props}
        >
          <table>
            <colgroup {...colGroupProps}>
              {colSizes.map((width, index) => (
                <col
                  key={index}
                  style={{
                    minWidth: minColumnWidth,
                    width: width || undefined,
                  }}
                />
              ))}
            </colgroup>

            <tbody className="min-w-full">{children}</tbody>
          </table>
        </PlateElement>
      </div>
    </TableFloatingToolbar>
  );
});
TableElement.displayName = 'TableElement';

export { TableElement, TableFloatingToolbar, TableBordersDropdownMenuContent };
