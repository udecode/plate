import React, { ReactNode } from 'react';
import { commentsData, usersData } from '@/plate/demo/values/commentsValue';
import { CommentsProvider as CommentsProviderPrimitive } from '@udecode/plate-comments';

export function CommentsProvider({ children }: { children: ReactNode }) {
  return (
    <CommentsProviderPrimitive
      comments={commentsData}
      users={usersData}
      myUserId="1"
      /* eslint-disable no-console */
      onCommentAdd={(comment) => console.log('Comment added', comment)}
      onCommentDelete={(comment) => console.log('Comment deleted', comment)}
      onCommentUpdate={(comment) => console.log('Comment updated', comment)}
      /* eslint-enable no-console */
    >
      {children}
    </CommentsProviderPrimitive>
  );
}
