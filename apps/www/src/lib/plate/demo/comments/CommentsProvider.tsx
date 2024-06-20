import React, { type ReactNode } from 'react';

import { CommentsProvider as CommentsProviderPrimitive } from '@udecode/plate-comments';

import { commentsData, usersData } from '@/plate/demo/values/commentsValue';

export function CommentsProvider({ children }: { children: ReactNode }) {
  return (
    <CommentsProviderPrimitive
      commentsList={commentsData}
      myUserId="1"
      /* eslint-disable no-console */
      onCommentAdd={(comments, content, myUserId) => {
        console.log('🚀 ~ CommentsProvider ~ comments:', comments);
        console.log('🚀 ~ CommentsProvider ~ value:', content);
        console.log('🚀 ~ CommentsProvider ~ myUserId:', myUserId);
      }}
      onCommentDelete={(reply, comments, myUserId) => {
        console.log('🚀 ~ onCommentDelete ~ reply:', reply);
        console.log('Comment deleted', comments);
        console.log('🚀 ~ onCommentDelete ~ myUserId:', myUserId);
      }}
      onCommentUpdate={(reply, comments, content, myUserId) => {
        console.log('🚀 ~ CommentsProvider ~ reply:', reply);
        console.log('🚀 ~ CommentsProvider ~ comments:', comments);
        console.log('🚀 ~ CommentsProvider ~ content:', content);
        console.log('🚀 ~ CommentsProvider ~ myUserId:', myUserId);
      }}
      // TODO:remove
      users={usersData}
      /* eslint-enable no-console */
    >
      {children}
    </CommentsProviderPrimitive>
  );
}
