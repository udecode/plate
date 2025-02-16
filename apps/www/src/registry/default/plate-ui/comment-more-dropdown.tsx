'use client';

import React, { useContext } from 'react';

import { cn } from '@udecode/cn';
import { MoreHorizontalIcon, PencilIcon, TrashIcon } from 'lucide-react';

import type { TCommentItem } from './block-comments-card';

import { ForceUpdateContext } from './block-comments';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

interface CommentMoreDropdownProps {
  comment: TCommentItem;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  onCloseAutoFocus?: () => void;
  onRemoveComment?: () => void;
}

export function CommentMoreDropdown(props: CommentMoreDropdownProps) {
  const {
    comment,
    dropdownOpen,
    setDropdownOpen,
    setEditingId,
    onCloseAutoFocus,
    onRemoveComment,
  } = props;

  const forceUpdate = useContext(ForceUpdateContext);

  const selectedEditCommentRef = React.useRef<boolean>(false);

  const onDeleteComment = React.useCallback(() => {
    if (!comment.id)
      return alert('You are operating too quickly, please try again later.');

    // Get discussions from session storage
    const discussions = JSON.parse(
      sessionStorage.getItem('discussions') || '[]'
    );

    // Find and update the discussion
    const updatedDiscussions = discussions.map((discussion: any) => {
      if (discussion.id !== comment.discussionId) {
        return discussion;
      }

      const commentIndex = discussion.comments.findIndex(
        (c: any) => c.id === comment.id
      );
      if (commentIndex === -1) {
        return discussion;
      }

      return {
        ...discussion,
        comments: [
          ...discussion.comments.slice(0, commentIndex),
          ...discussion.comments.slice(commentIndex + 1),
        ],
      };
    });

    // Save back to session storage
    sessionStorage.setItem('discussions', JSON.stringify(updatedDiscussions));
    onRemoveComment?.();
    forceUpdate();
  }, [comment.discussionId, comment.id, forceUpdate, onRemoveComment]);

  const onEditComment = React.useCallback(() => {
    selectedEditCommentRef.current = true;

    if (!comment.id)
      return alert('You are operating too quickly, please try again later.');

    setEditingId(comment.id);
    forceUpdate();
  }, [comment.id, forceUpdate, setEditingId]);

  return (
    <DropdownMenu
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      modal={false}
    >
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" className={cn('h-6 p-1 text-muted-foreground')}>
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48"
        onCloseAutoFocus={(e) => {
          if (selectedEditCommentRef.current) {
            onCloseAutoFocus?.();
            selectedEditCommentRef.current = false;
          }

          return e.preventDefault();
        }}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onEditComment}>
            <PencilIcon className="size-4" />
            Edit comment
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDeleteComment}>
            <TrashIcon className="size-4" />
            Delete comment
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
