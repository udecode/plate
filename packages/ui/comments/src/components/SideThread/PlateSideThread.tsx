import React from 'react';
import { createPortal } from 'react-dom';
import { Comment, Thread, User } from '../../types';
import { PlateThread } from '../Thread';
import { SideThread } from './SideThread';
import { SideThreadPosition } from './SideThreadRoot';
import { sideThreadRootCss } from './styles';

export type PlateSideThreadProps = {
  position: SideThreadPosition;
  fetchContacts: () => User[];
  retrieveUser: () => User;
  thread: Thread;
  onCancel: () => void;
  onResolveThread?: () => void;
  onSave: (comment: Comment) => Thread;
  onSubmitComment?: (value: string, assignedTo?: User) => void;
  retrieveUserByEmail: (email: string) => User | undefined;
  hideThread?: () => void;
};

export const PlateSideThread = (props: PlateSideThreadProps) => {
  return createPortal(
    <SideThread.Root {...props} css={sideThreadRootCss}>
      <PlateThread
        {...props}
        showResolveThreadButton
        showReOpenThreadButton={false}
        showMoreButton
      />
    </SideThread.Root>,
    document.body
  );
};
