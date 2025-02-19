'use client';

import React, { useCallback, useState } from 'react';

import type * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

import { PopoverAnchor } from '@radix-ui/react-popover';
import { cn, withRef } from '@udecode/cn';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import { type TTableElement, setCellBackground } from '@udecode/plate-table';
import {
  TablePlugin,
  TableProvider,
  useTableBordersDropdownMenuContentState,
  useTableElement,
  useTableMergeState,
} from '@udecode/plate-table/react';
import {
  PlateElement,
  useEditorPlugin,
  useEditorRef,
  useEditorSelector,
  useElement,
  usePluginOption,
  useReadOnly,
  useRemoveNodeButton,
  useSelected,
  withHOC,
} from '@udecode/plate/react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CombineIcon,
  EraserIcon,
  Grid2X2Icon,
  PaintBucketIcon,
  SquareSplitHorizontalIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';

import { DEFAULT_COLORS } from './color-constants';
import { ColorDropdownMenuItems } from './color-dropdown-menu-items';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Popover, PopoverContent } from './popover';
import {
  BorderAll,
  BorderBottom,
  BorderLeft,
  BorderNone,
  BorderRight,
  BorderTop,
} from './table-icons';
import { Toolbar, ToolbarButton, ToolbarGroup } from './toolbar';

export const TableElement = withHOC(
  TableProvider,
  withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
    const readOnly = useReadOnly();
    const isSelectionAreaVisible = usePluginOption(
      BlockSelectionPlugin,
      'isSelectionAreaVisible'
    );
    const hasControls = !readOnly && !isSelectionAreaVisible;
    const selected = useSelected();
    const {
      isSelectingCell,
      marginLeft,
      props: tableProps,
    } = useTableElement();

    const content = (
      <PlateElement
        className={cn(
          className,
          'overflow-x-auto py-5',
          hasControls && '-ml-2 *:data-[slot=block-selection]:left-2'
        )}
        style={{ paddingLeft: marginLeft }}
        {...props}
      >
        <div className="group/table relative w-fit">
          <table
            ref={ref}
            className={cn(
              'mr-0 ml-px table h-px table-fixed border-collapse',
              isSelectingCell && 'selection:bg-transparent'
            )}
            {...tableProps}
          >
            <tbody className="min-w-full">{children}</tbody>
          </table>
        </div>
      </PlateElement>
    );

    if (readOnly || !selected) {
      return content;
    }

    return <TableFloatingToolbar>{content}</TableFloatingToolbar>;
  })
);

export const TableFloatingToolbar = withRef<typeof PopoverContent>(
  ({ children, ...props }, ref) => {
    const { tf } = useEditorPlugin(TablePlugin);
    const element = useElement<TTableElement>();
    const { props: buttonProps } = useRemoveNodeButton({ element });
    const collapsed = useEditorSelector(
      (editor) => !editor.api.isExpanded(),
      []
    );

    const { canMerge, canSplit } = useTableMergeState();

    return (
      <Popover open={canMerge || canSplit || collapsed} modal={false}>
        <PopoverAnchor asChild>{children}</PopoverAnchor>
        <PopoverContent
          ref={ref}
          asChild
          onOpenAutoFocus={(e) => e.preventDefault()}
          contentEditable={false}
          {...props}
        >
          <Toolbar
            className="flex scrollbar-hide w-auto max-w-[80vw] flex-row overflow-x-auto rounded-md border bg-popover p-1 shadow-md print:hidden"
            contentEditable={false}
          >
            <ToolbarGroup>
              <ColorDropdownMenu tooltip="Background color">
                <PaintBucketIcon />
              </ColorDropdownMenu>
              {canMerge && (
                <ToolbarButton
                  onClick={() => tf.table.merge()}
                  onMouseDown={(e) => e.preventDefault()}
                  tooltip="Merge cells"
                >
                  <CombineIcon />
                </ToolbarButton>
              )}
              {canSplit && (
                <ToolbarButton
                  onClick={() => tf.table.split()}
                  onMouseDown={(e) => e.preventDefault()}
                  tooltip="Split cell"
                >
                  <SquareSplitHorizontalIcon />
                </ToolbarButton>
              )}

              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <ToolbarButton tooltip="Cell borders">
                    <Grid2X2Icon />
                  </ToolbarButton>
                </DropdownMenuTrigger>

                <DropdownMenuPortal>
                  <TableBordersDropdownMenuContent />
                </DropdownMenuPortal>
              </DropdownMenu>

              {collapsed && (
                <ToolbarGroup>
                  <ToolbarButton tooltip="Delete table" {...buttonProps}>
                    <Trash2Icon />
                  </ToolbarButton>
                </ToolbarGroup>
              )}
            </ToolbarGroup>

            {collapsed && (
              <ToolbarGroup>
                <ToolbarButton
                  onClick={() => {
                    tf.insert.tableRow({ before: true });
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  tooltip="Insert row before"
                >
                  <ArrowUp />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => {
                    tf.insert.tableRow();
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  tooltip="Insert row after"
                >
                  <ArrowDown />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => {
                    tf.remove.tableRow();
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  tooltip="Delete row"
                >
                  <XIcon />
                </ToolbarButton>
              </ToolbarGroup>
            )}

            {collapsed && (
              <ToolbarGroup>
                <ToolbarButton
                  onClick={() => {
                    tf.insert.tableColumn({ before: true });
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  tooltip="Insert column before"
                >
                  <ArrowLeft />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => {
                    tf.insert.tableColumn();
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  tooltip="Insert column after"
                >
                  <ArrowRight />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => {
                    tf.remove.tableColumn();
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  tooltip="Delete column"
                >
                  <XIcon />
                </ToolbarButton>
              </ToolbarGroup>
            )}
          </Toolbar>
        </PopoverContent>
      </Popover>
    );
  }
);

export const TableBordersDropdownMenuContent = withRef<
  typeof DropdownMenuPrimitive.Content
>((props, ref) => {
  const editor = useEditorRef();
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
      ref={ref}
      className={cn('min-w-[220px]')}
      onCloseAutoFocus={(e) => {
        e.preventDefault();
        editor.tf.focus();
      }}
      align="start"
      side="right"
      sideOffset={0}
      {...props}
    >
      <DropdownMenuGroup>
        <DropdownMenuCheckboxItem
          checked={hasTopBorder}
          onCheckedChange={getOnSelectTableBorder('top')}
        >
          <BorderTop />
          <div>Top Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={hasRightBorder}
          onCheckedChange={getOnSelectTableBorder('right')}
        >
          <BorderRight />
          <div>Right Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={hasBottomBorder}
          onCheckedChange={getOnSelectTableBorder('bottom')}
        >
          <BorderBottom />
          <div>Bottom Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={hasLeftBorder}
          onCheckedChange={getOnSelectTableBorder('left')}
        >
          <BorderLeft />
          <div>Left Border</div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuGroup>

      <DropdownMenuGroup>
        <DropdownMenuCheckboxItem
          checked={hasNoBorders}
          onCheckedChange={getOnSelectTableBorder('none')}
        >
          <BorderNone />
          <div>No Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={hasOuterBorders}
          onCheckedChange={getOnSelectTableBorder('outer')}
        >
          <BorderAll />
          <div>Outside Borders</div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
});

type ColorDropdownMenuProps = {
  children: React.ReactNode;
  tooltip: string;
};

function ColorDropdownMenu({ children, tooltip }: ColorDropdownMenuProps) {
  const [open, setOpen] = useState(false);

  const editor = useEditorRef();
  const selectedCells = usePluginOption(TablePlugin, 'selectedCells');

  const onUpdateColor = useCallback(
    (color: string) => {
      setOpen(false);
      setCellBackground(editor, { color, selectedCells: selectedCells ?? [] });
    },
    [selectedCells, editor]
  );

  const onClearColor = useCallback(() => {
    setOpen(false);
    setCellBackground(editor, {
      color: null,
      selectedCells: selectedCells ?? [],
    });
  }, [selectedCells, editor]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton tooltip={tooltip}>{children}</ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup label="Colors">
          <ColorDropdownMenuItems
            className="px-2"
            colors={DEFAULT_COLORS}
            updateColor={onUpdateColor}
          />
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuItem className="p-2" onClick={onClearColor}>
            <EraserIcon />
            <span>Clear</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
