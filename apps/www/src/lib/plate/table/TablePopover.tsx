import React from 'react';
import { PopoverAnchor } from '@radix-ui/react-popover';
import {
  isCollapsed,
  useElement,
  usePlateEditorState,
  useRemoveNodeButtonProps,
} from '@udecode/plate-common';
import { PopoverProps } from '@udecode/plate-floating';
import { TTableElement } from '@udecode/plate-table';
import { useReadOnly, useSelected } from 'slate-react';
import { TableBordersDropdownMenuContent } from './TableBordersDropdownMenuContent';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent } from '@/components/ui/popover';

export function TablePopover({ children, ...props }: PopoverProps) {
  const element = useElement<TTableElement>();
  const removeNodeButtonProps = useRemoveNodeButtonProps({ element });

  const readOnly = useReadOnly();
  const selected = useSelected();
  const editor = usePlateEditorState();
  const open = !readOnly && selected && isCollapsed(editor.selection);

  return (
    <Popover open={open} {...props}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      <PopoverContent
        className="z-30 flex w-[220px] flex-col gap-1 p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
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

        <Button
          contentEditable={false}
          variant="ghost"
          isMenu
          {...removeNodeButtonProps}
        >
          <Icons.delete className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </PopoverContent>
    </Popover>
  );
}
