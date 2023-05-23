import React from 'react';
import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { PopoverAnchor } from '@radix-ui/react-popover';
import {
  isCollapsed,
  useElement,
  usePlateEditorState,
} from '@udecode/plate-common';
import { TTableElement } from '@udecode/plate-table';
import { useReadOnly, useSelected } from 'slate-react';
import { PlateTableBordersDropdownMenuContent } from './PlateTableBordersDropdownMenuContent';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { RemoveNodeButton } from '@/plate/button/RemoveNodeButton';

export function TableDropdownMenu({ children, ...props }: DropdownMenuProps) {
  const element = useElement<TTableElement>();

  const readOnly = useReadOnly();
  const selected = useSelected();
  const editor = usePlateEditorState();
  const open = !readOnly && selected && isCollapsed(editor.selection);

  return (
    <Popover open={open}>
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
            <PlateTableBordersDropdownMenuContent />
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
  // <div className="min-w-[140px] px-1 py-1.5">
  //    <DropdownMenuContent className="w-56">
  //     <DropdownMenuLabel>My Account</DropdownMenuLabel>
  //     <DropdownMenuSeparator />
  //     <DropdownMenuGroup>
  //       <DropdownMenuItem>
  //         <User className="mr-2 h-4 w-4" />
  //         <span>Profile</span>
  //         <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
  //       </DropdownMenuItem>
  //       <DropdownMenuItem>
  //         <CreditCard className="mr-2 h-4 w-4" />
  //         <span>Billing</span>
  //         <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
  //       </DropdownMenuItem>
  //       <DropdownMenuItem>
  //         <Settings className="mr-2 h-4 w-4" />
  //         <span>Settings</span>
  //         <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
  //       </DropdownMenuItem>
  //       <DropdownMenuItem>
  //         <Keyboard className="mr-2 h-4 w-4" />
  //         <span>Keyboard shortcuts</span>
  //         <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
  //       </DropdownMenuItem>
  //     </DropdownMenuGroup>
  //     <DropdownMenuSeparator />
  //     <DropdownMenuGroup>
  //       <DropdownMenuItem>
  //         <Users className="mr-2 h-4 w-4" />
  //         <span>Team</span>
  //       </DropdownMenuItem>
  //       <DropdownMenuSub>
  //         <DropdownMenuSubTrigger>
  //           <UserPlus className="mr-2 h-4 w-4" />
  //           <span>Invite users</span>
  //         </DropdownMenuSubTrigger>
  //         <DropdownMenuPortal>
  //           <DropdownMenuSubContent>
  //             <DropdownMenuItem>
  //               <Mail className="mr-2 h-4 w-4" />
  //               <span>Email</span>
  //             </DropdownMenuItem>
  //             <DropdownMenuItem>
  //               <MessageSquare className="mr-2 h-4 w-4" />
  //               <span>Message</span>
  //             </DropdownMenuItem>
  //             <DropdownMenuSeparator />
  //             <DropdownMenuItem>
  //               <PlusCircle className="mr-2 h-4 w-4" />
  //               <span>More...</span>
  //             </DropdownMenuItem>
  //           </DropdownMenuSubContent>
  //         </DropdownMenuPortal>
  //       </DropdownMenuSub>
  //       <DropdownMenuItem>
  //         <Plus className="mr-2 h-4 w-4" />
  //         <span>New Team</span>
  //         <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
  //       </DropdownMenuItem>
  //     </DropdownMenuGroup>
  //     <DropdownMenuSeparator />
  //     <DropdownMenuItem>
  //       <Github className="mr-2 h-4 w-4" />
  //       <span>GitHub</span>
  //     </DropdownMenuItem>
  //     <DropdownMenuItem>
  //       <LifeBuoy className="mr-2 h-4 w-4" />
  //       <span>Support</span>
  //     </DropdownMenuItem>
  //     <DropdownMenuItem disabled>
  //       <Cloud className="mr-2 h-4 w-4" />
  //       <span>API</span>
  //     </DropdownMenuItem>
  //     <DropdownMenuSeparator />
  //     <DropdownMenuItem>
  //       <LogOut className="mr-2 h-4 w-4" />
  //       <span>Log out</span>
  //       <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
  //     </DropdownMenuItem>
  //    </DropdownMenuContent>
}
