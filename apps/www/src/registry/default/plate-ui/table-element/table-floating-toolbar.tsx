import React from 'react';
import { PopoverAnchor } from '@radix-ui/react-popover';
import {
  isCollapsed,
  useElement,
  usePlateEditorState,
  useRemoveNodeButton,
} from '@udecode/plate-common';
import { PopoverProps } from '@udecode/plate-floating';
import { TTableElement } from '@udecode/plate-table';
import { someNode } from '@udecode/slate';
import { useReadOnly } from 'slate-react';
import { TableBordersDropdownMenuContent } from './table-borders';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Button } from '@/registry/default/ui/button';
import {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/registry/default/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  popoverVariants,
} from '@/registry/default/ui/popover';

export function TableFloatingToolbar({ children, ...props }: PopoverProps) {
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
    <Popover open={open} {...props}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      <PopoverContent
        className={cn(popoverVariants(), 'flex w-[220px] flex-col gap-1 p-1')}
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

        <Button contentEditable={false} variant="ghost" isMenu {...buttonProps}>
          <Icons.delete className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </PopoverContent>
    </Popover>
  );
}
