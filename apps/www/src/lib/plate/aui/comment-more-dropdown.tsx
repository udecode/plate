import React from 'react';
import { useCommentEditButton } from '@udecode/plate';
import { useCommentDeleteButton } from '@udecode/plate-comments';
import { cn } from '@udecode/plate-tailwind';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function CommentMoreDropdown() {
  const editProps = useCommentEditButton({});
  const deleteProps = useCommentDeleteButton({});

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn('h-6 p-1 text-muted-foreground')}>
          <Icons.more className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem {...(editProps as any)}>
          Edit comment
        </DropdownMenuItem>
        <DropdownMenuItem {...(deleteProps as any)}>
          Delete comment
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
