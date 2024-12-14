import React from 'react';

import type { TCommentText } from '@udecode/plate-comments';
import type { StaticLeafProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import { PlateStaticLeaf } from '@udecode/plate-common';

export function CommentLeafStatic({
  children,
  className,
  ...props
}: StaticLeafProps<TCommentText>) {
  return (
    <PlateStaticLeaf
      className={cn(
        'border-b-2 border-b-highlight/35 bg-highlight/15',
        className
      )}
      {...props}
    >
      <>{children}</>
    </PlateStaticLeaf>
  );
}
