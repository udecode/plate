import React, { useCallback, useEffect } from 'react';
import { User } from '@xolvio/plate-comments';
import {
  OnAddThread,
  SideThread,
  useComments,
} from '@xolvio/plate-ui-comments';
import { user } from '../user';
import { useFetchContacts } from './useFetchContacts';

const userMap = new Map([[user.email, user]]);

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
      fetchContacts={fetchContacts}
      retrieveUser={retrieveUser}
      retrieveUserByEmailAddress={retrieveUserByEmailAddress}
    />
  ) : null;
}
