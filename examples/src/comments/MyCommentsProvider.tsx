import React, { ReactNode } from 'react';
import { CommentsProvider } from '@udecode/plate';
import { commentsData, usersData } from './constants';

export function MyCommentsProvider({ children }: { children: ReactNode }) {
  return (
    <CommentsProvider comments={commentsData} users={usersData} myUserId="1">
      {children}
    </CommentsProvider>
  );
}
