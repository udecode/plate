import React, { useCallback, useEffect } from 'react';
import { User } from '@xolvio/plate-comments';
import {
  OnAddThread,
  SideThread,
  useComments,
} from '@xolvio/plate-ui-comments';
import { user } from '../user';
import { useFetchContacts } from './useFetchContacts';
import { users } from './users';

const userMap = new Map(users.map((user2) => [user2.email, user2]));

export function Comments({
  setOnAddThread,
}: {
  setOnAddThread: React.Dispatch<React.SetStateAction<OnAddThread>>;
}) {
  const fetchContacts = useFetchContacts();

  const retrieveUser = useCallback(function retrieveUser() {
    return { ...user };
  }, []);

  const retrieveUserByEmailAddress = useCallback(
    function retrieveUserByEmailAddress(emailAddress: string): User | null {
      return userMap.get(emailAddress) ?? null;
    },
    []
  );

  const {
    thread,
    position: threadPosition,
    onAddThread,
    onSaveComment,
    onSubmitComment,
    onCancelCreateThread,
    onResolveThread,
  } = useComments({ retrieveUser });

  useEffect(
    function setSetOnAddThread() {
      setOnAddThread(() => onAddThread);
    },
    [setOnAddThread, onAddThread]
  );

  return thread ? (
    <SideThread
      thread={thread}
      position={threadPosition}
      onSaveComment={onSaveComment}
      onSubmitComment={onSubmitComment}
      onCancelCreateThread={onCancelCreateThread}
      onResolveThread={onResolveThread}
      fetchContacts={fetchContacts}
      retrieveUser={retrieveUser}
      retrieveUserByEmailAddress={retrieveUserByEmailAddress}
    />
  ) : null;
}
