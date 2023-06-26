export const myCommentsProviderCode = `import React, { ReactNode } from 'react';
import { CommentsProvider } from '@udecode/plate';
import { commentsData, usersData } from './constants';

export const MyCommentsProvider = ({ children }: { children: ReactNode }) => {
  return (
    <CommentsProvider comments={commentsData} users={usersData} myUserId="1">
      {children}
    </CommentsProvider>
  );
};
`;

export const myCommentsProviderFile = {
  '/comments/MyCommentsProvider.tsx': myCommentsProviderCode,
};
