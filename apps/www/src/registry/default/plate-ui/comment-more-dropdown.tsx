'use client';

import React from 'react';

import type { TReply } from '@udecode/plate-comments';

import { cn } from '@udecode/cn';
import {
  useCommentDeleteButton,
  useCommentDeleteButtonState,
  useCommentEditButton,
  useCommentEditButtonState,
} from '@udecode/plate-comments';

import { Icons } from '@/components/icons';

import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

export function CommentMoreDropdown({ reply }: { reply: TReply }) {
  const editButtonState = useCommentEditButtonState(reply);
  const { props: editProps } = useCommentEditButton(editButtonState);

  const deleteButtonState = useCommentDeleteButtonState(reply);
  const { props: deleteProps } = useCommentDeleteButton(deleteButtonState);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button className={cn('h-6 p-1 text-muted-foreground')} variant="ghost">
          <Icons.more className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem {...editProps}>Edit comment</DropdownMenuItem>
        <DropdownMenuItem {...deleteProps}>Delete comment</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
