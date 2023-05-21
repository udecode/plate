import React from 'react';
import {
  CheckIcon,
  CommentResolveButton,
  RefreshIcon,
  useComment,
} from '@udecode/plate-comments';
import { cn } from '@udecode/plate-tailwind';

import { buttonVariants } from '@/plate/button/PlateButton';

export function PlateCommentResolveButton() {
  const comment = useComment()!;

  return (
    <CommentResolveButton className={cn(buttonVariants(), 'p-1')}>
      {comment.isResolved ? (
        <RefreshIcon className="h-6 w-6 text-gray-500" />
      ) : (
        <CheckIcon className="h-6 w-6 text-gray-500" />
      )}
    </CommentResolveButton>
  );
}
