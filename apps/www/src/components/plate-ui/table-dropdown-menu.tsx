import React from 'react';
import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { focusEditor, someNode } from '@udecode/plate-common';
import {
  deleteColumn,
  deleteRow,
  deleteTable,
  ELEMENT_TABLE,
  insertTable,
  insertTableColumn,
  insertTableRow,
} from '@udecode/plate-table';

import { Icons, iconVariants } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  useOpenState,
} from '@/components/ui/dropdown-menu';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { useMyPlateEditorState } from '@/plate/plate.types';

export function TableDropdownMenu(props: DropdownMenuProps) {
  const editor = useMyPlateEditorState();

  const tableSelected = someNode(editor, {
    match: { type: ELEMENT_TABLE },
  });

  const openState = useOpenState();

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Table" isDropdown>
          <Icons.table />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="flex w-[180px] min-w-0 flex-col gap-0.5"
      >
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Icons.table className={iconVariants({ variant: 'menuItem' })} />
            <span>Table</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              className="min-w-[180px]"
              onSelect={async () => {
                insertTable(editor);
                focusEditor(editor);
              }}
            >
              <Icons.add className={iconVariants({ variant: 'menuItem' })} />
              Insert table
            </DropdownMenuItem>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!tableSelected}
              onSelect={async () => {
                deleteTable(editor);
                focusEditor(editor);
              }}
            >
              <Icons.trash className={iconVariants({ variant: 'menuItem' })} />
              Delete table
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={!tableSelected}>
            <Icons.column className={iconVariants({ variant: 'menuItem' })} />
            <span>Column</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!tableSelected}
              onSelect={async () => {
                insertTableColumn(editor);
                focusEditor(editor);
              }}
            >
              <Icons.add className={iconVariants({ variant: 'menuItem' })} />
              Insert column after
            </DropdownMenuItem>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!tableSelected}
              onSelect={async () => {
                deleteColumn(editor);
                focusEditor(editor);
              }}
            >
              <Icons.minus className={iconVariants({ variant: 'menuItem' })} />
              Delete column
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={!tableSelected}>
            <Icons.row className={iconVariants({ variant: 'menuItem' })} />
            <span>Row</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!tableSelected}
              onSelect={async () => {
                insertTableRow(editor);
                focusEditor(editor);
              }}
            >
              <Icons.add className={iconVariants({ variant: 'menuItem' })} />
              Insert row after
            </DropdownMenuItem>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!tableSelected}
              onSelect={async () => {
                deleteRow(editor);
                focusEditor(editor);
              }}
            >
              <Icons.minus className={iconVariants({ variant: 'menuItem' })} />
              Delete row
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
