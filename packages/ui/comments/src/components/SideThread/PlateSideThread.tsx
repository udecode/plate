import React from 'react';
import { createPortal } from 'react-dom';
import { Contact, Thread, User } from '../../utils';
import { PlateThread } from '../Thread';
import { SideThread } from './SideThread';
import { SideThreadPosition } from './SideThreadRoot';
import { sideThreadRootCss } from './styles';

export type PlateSideThreadProps = {
  position: SideThreadPosition;
  fetchContacts: () => Contact[];
  retrieveUser: () => User;
  thread: Thread;
};

export const PlateSideThread = (props: PlateSideThreadProps) => {
  return createPortal(
    <SideThread.Root {...props} css={sideThreadRootCss}>
      <PlateThread
        {...props}
        value=""
        showResolveThreadButton
        showReOpenThreadButton={false}
        showMoreButton
      />
    </SideThread.Root>,
    document.body
  );
};
