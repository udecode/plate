import React from 'react';
import { PopoverAnchor } from '@radix-ui/react-popover';
import {
  isCollapsed,
  useElement,
  usePlateEditorState,
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
import { RemoveNodeButton } from '@/plate/button/RemoveNodeButton';

export function TablePopover({ children, ...props }: PopoverProps) {
  const element = useElement<TTableElement>();

  const readOnly = useReadOnly();
  const selected = useSelected();
  const editor = usePlateEditorState();
  const open = !readOnly && selected && isCollapsed(editor.selection);

  return (
    <Popover open={open} {...props}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      <PopoverContent className="z-30 flex w-[220px] flex-col gap-1 p-1">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="menu">
              <Icons.borderAll className="mr-2 h-4 w-4" />
              Borders
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuPortal>
            <TableBordersDropdownMenuContent />
          </DropdownMenuPortal>
        </DropdownMenu>

        <RemoveNodeButton
          element={element}
          variant="menu"
          contentEditable={false}
        >
          <div>Delete</div>
        </RemoveNodeButton>
      </PopoverContent>
    </Popover>
  );
}
