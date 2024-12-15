import React from 'react';

import type { TCommentText } from '@udecode/plate-comments';
import type { PlateLeafStaticProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import { PlateLeafStatic } from '@udecode/plate-common';

export function CommentLeafStatic({
  children,
  className,
  ...props
}: PlateLeafStaticProps<TCommentText>) {
  return (
    <PlateLeafStatic
      className={cn(
        'border-b-2 border-b-highlight/35 bg-highlight/15',
        className
      )}
      {...props}
    >
      <>{children}</>
    </PlateLeafStatic>
  );
}
