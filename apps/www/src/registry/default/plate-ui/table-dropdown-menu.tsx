'use client';

import React, { useCallback, useState } from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { cn } from '@udecode/cn';
import { someNode } from '@udecode/plate-common';
import {
  focusEditor,
  useEditorPlugin,
  useEditorSelector,
} from '@udecode/plate-common/react';
import { TablePlugin, useTableMergeState } from '@udecode/plate-table/react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Combine,
  RectangleHorizontalIcon,
  RectangleVerticalIcon,
  Table,
  Trash,
  Ungroup,
  XIcon,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { ToolbarButton } from './toolbar';

const COLS = 8;

export function TableDropdownMenu(props: DropdownMenuProps) {
  const tableSelected = useEditorSelector(
    (editor) => someNode(editor, { match: { type: TablePlugin.key } }),
    []
  );

  const { editor, tf } = useEditorPlugin(TablePlugin);
  const openState = useOpenState();
  const mergeState = useTableMergeState();

  const [table, setTable] = useState(
    Array.from({ length: COLS }, () => Array.from({ length: COLS }).fill(0))
  );
  const [size, setSize] = useState({ colCount: 0, rowCount: 0 });

  const onCellMove = useCallback(
    (rowIndex: number, colIndex: number) => {
      const newTables = [...table];

      for (let i = 0; i < newTables.length; i++) {
        for (let j = 0; j < newTables[i].length; j++) {
          newTables[i][j] =
            i >= 0 && i <= rowIndex && j >= 0 && j <= colIndex ? 1 : 0;
        }
      }

      setSize({ colCount: colIndex + 1, rowCount: rowIndex + 1 });
      setTable(newTables);
    },
    [table]
  );

  const onInsertTable = useCallback(() => {
    insertTable(editor, size);
    focusEditor(editor);
  }, [editor, size]);

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Table" isDropdown>
          <Table />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex w-[180px] min-w-0 flex-col"
        align="start"
      >
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Table />
              <span>Table</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="m-0 p-0">
              <div className="m-0 !flex flex-col p-0" onClick={onInsertTable}>
                <div className="grid size-[130px] grid-cols-8 gap-0.5 p-1">
                  {table.map((rows, rowIndex) =>
                    rows.map((value, columIndex) => {
                      return (
                        <div
                          key={`(${rowIndex},${columIndex})`}
                          className={cn(
                            'col-span-1 size-3 border border-solid bg-secondary',
                            !!value && 'border-current'
                          )}
                          onMouseMove={() => {
                            onCellMove(rowIndex, columIndex);
                          }}
                        />
                      );
                    })
                  )}
                </div>

                <div className="text-center text-xs text-current">
                  {size.rowCount} x {size.colCount}
                </div>
              </div>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={!tableSelected}>
              <RectangleVerticalIcon className="rotate-90" />
              <span>Column</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  tf.insert.tableColumn({ before: true });
                  focusEditor(editor);
                }}
              >
                <ArrowLeft />
                Insert column before
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  tf.insert.tableColumn();
                  focusEditor(editor);
                }}
              >
                <ArrowRight />
                Insert column after
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  tf.remove.tableColumn();
                  focusEditor(editor);
                }}
              >
                <XIcon />
                Delete column
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={!tableSelected}>
              <RectangleHorizontalIcon />
              <span>Row</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  tf.insert.tableRow({ before: true });
                  focusEditor(editor);
                }}
              >
                <ArrowUp />
                Insert row before
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  tf.insert.tableRow();
                  focusEditor(editor);
                }}
              >
                <ArrowDown />
                Insert row after
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  tf.remove.tableRow();
                  focusEditor(editor);
                }}
              >
                <XIcon />
                Delete row
              </DropdownMenuItem>
            </DropdownMenuSubContent>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!tableSelected}
              onSelect={() => {
                tf.remove.table();
                focusEditor(editor);
              }}
            >
              <Trash />
              Delete table
            </DropdownMenuItem>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={!tableSelected}>
              <Combine />
              <span>Merge</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!mergeState.canMerge}
                onSelect={() => {
                  tf.table.merge();
                  focusEditor(editor);
                }}
              >
                <Combine />
                Merge cells
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!mergeState.canSplit}
                onSelect={() => {
                  tf.table.split();
                  focusEditor(editor);
                }}
              >
                <Ungroup />
                Split cell
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
