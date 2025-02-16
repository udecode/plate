'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import {
  useCommentDeleteButton,
  useCommentEditButton,
} from '@udecode/plate-comments/react';
import { MoreHorizontal } from 'lucide-react';

import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

export function CommentMoreDropdown() {
  const { props: editProps } = useCommentEditButton();
  const { props: deleteProps } = useCommentDeleteButton();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn('h-6 p-1 text-muted-foreground')}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem {...editProps}>Edit comment</DropdownMenuItem>
          <DropdownMenuItem {...deleteProps}>Delete comment</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
