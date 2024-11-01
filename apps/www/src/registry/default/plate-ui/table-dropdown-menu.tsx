'use client';

import React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { someNode } from '@udecode/plate-common';
import {
  focusEditor,
  useEditorPlugin,
  useEditorSelector,
} from '@udecode/plate-common/react';
import { deleteTable, insertTableRow } from '@udecode/plate-table';
import {
  TablePlugin,
  deleteColumn,
  deleteRow,
  insertTable,
} from '@udecode/plate-table/react';
import {
  Minus,
  Plus,
  RectangleHorizontal,
  RectangleVertical,
  Table,
  Trash,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { ToolbarButton } from './toolbar';

export function TableDropdownMenu(props: DropdownMenuProps) {
  const tableSelected = useEditorSelector(
    (editor) => someNode(editor, { match: { type: TablePlugin.key } }),
    []
  );

  const { editor, tf } = useEditorPlugin(TablePlugin);

  const openState = useOpenState();

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Table" isDropdown>
          <Table />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex w-[180px] min-w-0 flex-col gap-0.5"
        align="start"
      >
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Table className="mr-2 size-5" />
            <span>Table</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              className="min-w-[180px]"
              onSelect={() => {
                insertTable(editor, {}, { select: true });
                focusEditor(editor);
              }}
            >
              <Plus className="mr-2 size-5" />
              Insert table
            </DropdownMenuItem>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!tableSelected}
              onSelect={() => {
                deleteTable(editor);
                focusEditor(editor);
              }}
            >
              <Trash className="mr-2 size-5" />
              Delete table
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={!tableSelected}>
            <RectangleVertical className="mr-2 size-5" />
            <span>Column</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!tableSelected}
              onSelect={() => {
                tf.insert.tableColumn();
                focusEditor(editor);
              }}
            >
              <Plus className="mr-2 size-5" />
              Insert column after
            </DropdownMenuItem>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!tableSelected}
              onSelect={() => {
                deleteColumn(editor);
                focusEditor(editor);
              }}
            >
              <Minus className="mr-2 size-5" />
              Delete column
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={!tableSelected}>
            <RectangleHorizontal className="mr-2 size-5" />
            <span>Row</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!tableSelected}
              onSelect={() => {
                insertTableRow(editor);
                focusEditor(editor);
              }}
            >
              <Plus className="mr-2 size-5" />
              Insert row after
            </DropdownMenuItem>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!tableSelected}
              onSelect={() => {
                deleteRow(editor);
                focusEditor(editor);
              }}
            >
              <Minus className="mr-2 size-5" />
              Delete row
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
