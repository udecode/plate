import React, { forwardRef } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { PopoverAnchor, PopoverContentProps } from '@radix-ui/react-popover';
import {
  PlateElement,
  PlateElementProps,
  isCollapsed,
  useElement,
  usePlateEditorState,
  useRemoveNodeButton,
} from '@udecode/plate-common';
import {
  TTableElement,
  useTableBordersDropdownMenuContentState,
  useTableElement,
  useTableElementState,
} from '@udecode/plate-table';
import { someNode } from '@udecode/slate';
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

  const readOnly = useReadOnly();
  const editor = usePlateEditorState();
  const open =
    !readOnly &&
    someNode(editor, {
      match: (n) => n === element,
    }) &&
    isCollapsed(editor.selection);

  return (
    <Popover open={open}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      <PopoverContent
        ref={ref}
        className={cn(popoverVariants(), 'flex w-[220px] flex-col gap-1 p-1')}
        onOpenAutoFocus={(e) => e.preventDefault()}
        {...props}
      >
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
      </PopoverContent>
    </Popover>
  );
});
TableFloatingToolbar.displayName = 'TableFloatingToolbar';

const TableElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  PlateElementProps
>(({ className, children, ...props }, ref) => {
  const { colSizes, isSelectingCell, minColumnWidth, marginLeft } =
    useTableElementState();
  const { props: tableProps, colGroupProps } = useTableElement();

  return (
    <TableFloatingToolbar>
      <div style={{ paddingLeft: marginLeft }}>
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
