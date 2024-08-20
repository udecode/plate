import React, { type ReactNode } from 'react';

import { CommentsProvider as CommentsProviderPrimitive } from '@udecode/plate-comments/react';

import { commentsData, usersData } from '@/plate/demo/values/commentsValue';

export function CommentsProvider({ children }: { children: ReactNode }) {
  return (
    <CommentsProviderPrimitive
      comments={commentsData}
      myUserId="1"
      onCommentAdd={(comment) => console.info('Comment added', comment)}
      onCommentDelete={(comment) => console.info('Comment deleted', comment)}
      onCommentUpdate={(comment) => console.info('Comment updated', comment)}
      users={usersData}
    >
      {children}
    </CommentsProviderPrimitive>
  );
}
