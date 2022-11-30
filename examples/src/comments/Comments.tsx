import React, { ReactNode } from 'react';
import { CommentsProvider, PlateFloatingComments } from '@udecode/plate';
import { commentsData, usersData } from './constants';

export const Comments = ({ children }: { children: ReactNode }) => {
  return (
    <CommentsProvider comments={commentsData} users={usersData} myUserId="1">
      {children}

      <PlateFloatingComments />
    </CommentsProvider>
  );
};
