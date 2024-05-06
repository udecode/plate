import React, { type ReactNode } from 'react';

import { CommentsProvider as CommentsProviderPrimitive } from '@udecode/plate-comments';

import { commentsData, usersData } from '@/plate/demo/values/commentsValue';

export function CommentsProvider({ children }: { children: ReactNode }) {
  return (
    <CommentsProviderPrimitive
      comments={commentsData}
      myUserId="1"
      /* eslint-disable no-console */
      onCommentAdd={(comment) => console.log('Comment added', comment)}
      onCommentDelete={(comment) => console.log('Comment deleted', comment)}
      onCommentUpdate={(comment) => console.log('Comment updated', comment)}
      users={usersData}
      /* eslint-enable no-console */
    >
      {children}
    </CommentsProviderPrimitive>
  );
}
