import React from 'react';
import {
  CommentDeleteButton,
  CommentEditButton,
  MoreVertIcon,
  useCommentActions,
  useCommentSelectors,
} from '@udecode/plate-comments';
import { cn } from '@udecode/plate-tailwind';
import { Button, buttonVariants } from '../button/PlateButton';
import { floatingStyles } from '../toolbar/floatingStyles';
import { ToolbarDropdown } from '../toolbar/ToolbarDropdown';

export function PlateCommentMenuButton() {
  const isMenuOpen = useCommentSelectors().isMenuOpen();
  const setIsMenuOpen = useCommentActions().isMenuOpen();

  return (
    <div>
      <ToolbarDropdown
        control={
          <Button className="p-1">
            <MoreVertIcon className="h-6 w-6 text-gray-500" />
          </Button>
        }
        open={isMenuOpen}
        onOpen={() => setIsMenuOpen(true)}
        onClose={() => setIsMenuOpen(false)}
      >
        <div
          className={cn(
            'relative flex flex-col',
            floatingStyles.rootVariants(),
            'w-[150px]'
          )}
        >
          <CommentEditButton
            className={cn(buttonVariants(), 'justify-start px-4 py-2')}
          >
            Edit comment
          </CommentEditButton>

          <CommentDeleteButton
            className={cn(buttonVariants(), 'justify-start px-4 py-2')}
          >
            Delete comment
          </CommentDeleteButton>
        </div>
      </ToolbarDropdown>
    </div>
  );
}
