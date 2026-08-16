'use client';

import * as React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { TablePlugin, useTableMergeState } from '@platejs/table/react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Combine,
  Grid3x3Icon,
  Table,
  Trash2Icon,
  Ungroup,
  XIcon,
} from 'lucide-react';
import { useEditor, useEditorSelector } from 'platejs/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import { ToolbarButton } from './toolbar';

export function TableToolbarButton(props: DropdownMenuProps) {
  const tableSelected = useEditorSelector((editor) =>
    editor.read.nodes.some({
      type: TablePlugin,
    })
  );

  const editor = useEditor();
  const [open, setOpen] = React.useState(false);
  const mergeState = useTableMergeState();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          aria-label="Table"
          className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
          tooltip="Table"
          isDropdown
        >
          <Table />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex w-[180px] min-w-0 flex-col"
        align="start"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          editor.api.dom.focus();
        }}
      >
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <Grid3x3Icon className="size-4" />
              <span>Table</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="m-0 p-0">
              <TablePicker onInsert={() => setOpen(false)} />
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className="gap-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              disabled={!tableSelected}
            >
              <div className="size-4" />
              <span>Cell</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!mergeState.canMerge}
                onSelect={() => {
                  editor.plugin(TablePlugin).update.merge();
                }}
              >
                <Combine />
                Merge cells
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!mergeState.canSplit}
                onSelect={() => {
                  editor.plugin(TablePlugin).update.split();
                }}
              >
                <Ungroup />
                Split cell
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className="gap-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              disabled={!tableSelected}
            >
              <div className="size-4" />
              <span>Row</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  editor.plugin(TablePlugin).update.insertRow({
                    before: true,
                  });
                }}
              >
                <ArrowUp />
                Insert row before
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  editor.plugin(TablePlugin).update.insertRow();
                }}
              >
                <ArrowDown />
                Insert row after
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  editor.plugin(TablePlugin).update.removeRow();
                }}
              >
                <XIcon />
                Delete row
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className="gap-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              disabled={!tableSelected}
            >
              <div className="size-4" />
              <span>Column</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  editor.plugin(TablePlugin).update.insertColumn({
                    before: true,
                  });
                }}
              >
                <ArrowLeft />
                Insert column before
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  editor.plugin(TablePlugin).update.insertColumn();
                }}
              >
                <ArrowRight />
                Insert column after
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  editor.plugin(TablePlugin).update.removeColumn();
                }}
              >
                <XIcon />
                Delete column
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem
            className="min-w-[180px]"
            disabled={!tableSelected}
            onSelect={() => {
              editor.plugin(TablePlugin).update.remove();
            }}
          >
            <Trash2Icon />
            Delete table
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const TABLE_PICKER_DIMENSION = 8;

function TablePicker({ onInsert }: { onInsert: () => void }) {
  const editor = useEditor();
  const [activeCell, setActiveCell] = React.useState({
    colIndex: 0,
    rowIndex: 0,
  });
  const cellRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const size = {
    colCount: activeCell.colIndex + 1,
    rowCount: activeCell.rowIndex + 1,
  };

  const insertTable = (rowIndex: number, colIndex: number) => {
    editor.plugin(TablePlugin).update.insert(
      {
        colCount: colIndex + 1,
        rowCount: rowIndex + 1,
      },
      { select: true }
    );
    onInsert();
  };

  const activateCell = (rowIndex: number, colIndex: number) => {
    setActiveCell((currentCell) => {
      if (
        currentCell.rowIndex === rowIndex &&
        currentCell.colIndex === colIndex
      ) {
        return currentCell;
      }

      return { colIndex, rowIndex };
    });
  };

  const moveFocus = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    rowIndex: number,
    colIndex: number
  ) => {
    const nextCell = { colIndex, rowIndex };

    switch (event.key) {
      case 'ArrowDown': {
        nextCell.rowIndex = Math.min(rowIndex + 1, TABLE_PICKER_DIMENSION - 1);
        break;
      }
      case 'ArrowLeft': {
        nextCell.colIndex = Math.max(colIndex - 1, 0);
        break;
      }
      case 'ArrowRight': {
        nextCell.colIndex = Math.min(colIndex + 1, TABLE_PICKER_DIMENSION - 1);
        break;
      }
      case 'ArrowUp': {
        nextCell.rowIndex = Math.max(rowIndex - 1, 0);
        break;
      }
      default:
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    activateCell(nextCell.rowIndex, nextCell.colIndex);
    cellRefs.current[
      nextCell.rowIndex * TABLE_PICKER_DIMENSION + nextCell.colIndex
    ]?.focus();
  };

  return (
    <div className="flex! m-0 flex-col p-0">
      <div
        aria-colcount={TABLE_PICKER_DIMENSION}
        aria-label="Table size"
        aria-rowcount={TABLE_PICKER_DIMENSION}
        className="grid size-[130px] grid-cols-8 gap-0.5 p-1"
        role="grid"
      >
        {Array.from({ length: TABLE_PICKER_DIMENSION }, (_, rowIndex) => (
          <div key={rowIndex} className="contents" role="row">
            {Array.from({ length: TABLE_PICKER_DIMENSION }, (_, colIndex) => {
              const isActive =
                activeCell.rowIndex === rowIndex &&
                activeCell.colIndex === colIndex;
              const isSelected =
                rowIndex <= activeCell.rowIndex &&
                colIndex <= activeCell.colIndex;

              return (
                <button
                  key={`(${rowIndex},${colIndex})`}
                  ref={(element) => {
                    cellRefs.current[
                      rowIndex * TABLE_PICKER_DIMENSION + colIndex
                    ] = element;
                  }}
                  aria-colindex={colIndex + 1}
                  aria-label={`Insert ${rowIndex + 1} by ${colIndex + 1} table`}
                  aria-rowindex={rowIndex + 1}
                  aria-selected={isSelected}
                  autoFocus={isActive}
                  className={cn(
                    'col-span-1 size-3 border border-solid bg-secondary',
                    isSelected && 'border-current'
                  )}
                  onClick={() => insertTable(rowIndex, colIndex)}
                  onFocus={() => activateCell(rowIndex, colIndex)}
                  onKeyDown={(event) => moveFocus(event, rowIndex, colIndex)}
                  onPointerMove={() => activateCell(rowIndex, colIndex)}
                  role="gridcell"
                  tabIndex={isActive ? 0 : -1}
                  type="button"
                />
              );
            })}
          </div>
        ))}
      </div>

      <div
        aria-atomic="true"
        aria-live="polite"
        className="text-center text-current text-xs"
      >
        {size.rowCount} x {size.colCount}
      </div>
    </div>
  );
}
