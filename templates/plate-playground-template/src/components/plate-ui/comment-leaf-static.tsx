import React from 'react';

import type { SlateLeafProps } from '@udecode/plate';
import type { TCommentText } from '@udecode/plate-comments';

import { cn } from '@udecode/cn';
import { SlateLeaf } from '@udecode/plate';

export function CommentLeafStatic({
  children,
  className,
  ...props
}: SlateLeafProps<TCommentText>) {
  return (
    <SlateLeaf
      className={cn(
        className,
        'border-b-2 border-b-highlight/35 bg-highlight/15'
      )}
      {...props}
    >
      <>{children}</>
    </SlateLeaf>
  );
}
