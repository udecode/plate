import React, { ReactNode } from 'react';
import { commentsData, usersData } from '@/plate/demo/values/commentsValue';
import { CommentsProvider as CommentsProviderPrimitive } from '@udecode/plate-comments';

export function CommentsProvider({ children }: { children: ReactNode }) {
  return (
    <CommentsProviderPrimitive
      comments={commentsData}
      users={usersData}
      myUserId="1"
    >
      {children}
    </CommentsProviderPrimitive>
  );
}
