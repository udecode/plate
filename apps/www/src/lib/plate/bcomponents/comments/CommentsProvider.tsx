import React, { ReactNode } from 'react';
import { CommentsProvider as CommentsProviderPrimitive } from '@udecode/plate';

import { commentsData, usersData } from '@/plate/demo/values/commentsValue';

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
