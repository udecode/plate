import React from 'react';
import { PopoverAnchor } from '@radix-ui/react-popover';
import { cn, withRef } from '@udecode/cn';
import { isSelectionExpanded } from '@udecode/plate-common';
import {
  PlateElement,
  useEditorRef,
  useEditorSelector,
  useElement,
  useRemoveNodeButton,
  withHOC,
} from '@udecode/plate-common/react';
import {
  mergeTableCells,
  TableProvider,
  unmergeTableCells,
  useTableBordersDropdownMenuContentState,
  useTableElement,
  useTableElementState,
  useTableMergeState,
} from '@udecode/plate-table/react';
import { useReadOnly, useSelected } from 'slate-react';

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

import type * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type { TTableElement } from '@udecode/plate-table';

export const TableBordersDropdownMenuContent = withRef<
  typeof DropdownMenuPrimitive.Content
>((props, ref) => {
  const {
    getOnSelectTableBorder,
    hasBottomBorder,
    hasLeftBorder,
    hasNoBorders,
    hasOuterBorders,
    hasRightBorder,
    hasTopBorder,
  } = useTableBordersDropdownMenuContentState();

  return (
    <DropdownMenuContent
      align="start"
      className={cn('min-w-[220px]')}
      ref={ref}
      side="right"
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

export const TableFloatingToolbar = withRef<typeof PopoverContent>(
  ({ children, ...props }, ref) => {
    const element = useElement<TTableElement>();
    const { props: buttonProps } = useRemoveNodeButton({ element });

    const selectionCollapsed = useEditorSelector(
      (editor) => !isSelectionExpanded(editor),
      []
    );

    const readOnly = useReadOnly();
    const selected = useSelected();
    const editor = useEditorRef();

    const collapsed = !readOnly && selected && selectionCollapsed;
    const open = !readOnly && selected;

    const { canMerge, canUnmerge } = useTableMergeState();

    const mergeContent = canMerge && (
      <Button
        contentEditable={false}
        isMenu
        onClick={() => mergeTableCells(editor)}
        variant="ghost"
      >
        <Icons.combine className="mr-2 size-4" />
        Merge
      </Button>
    );

    const unmergeButton = canUnmerge && (
      <Button
        contentEditable={false}
        isMenu
        onClick={() => unmergeTableCells(editor)}
        variant="ghost"
      >
        <Icons.ungroup className="mr-2 size-4" />
        Unmerge
      </Button>
    );

    const bordersContent = collapsed && (
      <>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button isMenu variant="ghost">
              <Icons.borderAll className="mr-2 size-4" />
              Borders
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuPortal>
            <TableBordersDropdownMenuContent />
          </DropdownMenuPortal>
        </DropdownMenu>

        <Button contentEditable={false} isMenu variant="ghost" {...buttonProps}>
          <Icons.delete className="mr-2 size-4" />
          Delete
        </Button>
      </>
    );

    return (
      <Popover modal={false} open={open}>
        <PopoverAnchor asChild>{children}</PopoverAnchor>
        {(canMerge || canUnmerge || collapsed) && (
          <PopoverContent
            className={cn(
              popoverVariants(),
              'flex w-[220px] flex-col gap-1 p-1'
            )}
            onOpenAutoFocus={(e) => e.preventDefault()}
            ref={ref}
            {...props}
          >
            {unmergeButton}
            {mergeContent}
            {bordersContent}
          </PopoverContent>
        )}
      </Popover>
    );
  }
);

export const TableElement = withHOC(
  TableProvider,
  withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
    const { colSizes, isSelectingCell, marginLeft, minColumnWidth } =
      useTableElementState();
    const { colGroupProps, props: tableProps } = useTableElement();

    return (
      <TableFloatingToolbar>
        <div style={{ paddingLeft: marginLeft }}>
          <PlateElement
            asChild
            className={cn(
              'my-4 ml-px mr-0 table h-px w-full table-fixed border-collapse',
              isSelectingCell && '[&_*::selection]:bg-none',
              className
            )}
            ref={ref}
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
  })
);
