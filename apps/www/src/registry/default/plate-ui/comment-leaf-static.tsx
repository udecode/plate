import React from 'react';

import type { TCommentText } from '@udecode/plate-comments';
import type { SlateLeafProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import { SlateLeaf } from '@udecode/plate-common';

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
