import React, { useCallback, useEffect } from 'react';
import { User } from '@xolvio/plate-comments';
import { SideThread, useComments } from '@xolvio/plate-ui-comments';
import { UseCommentsReturnType } from '@xolvio/plate-ui-comments/src';
import { useFetchContacts } from './useFetchContacts';
import { useRetrieveUser } from './useRetrieveUser';
import { users } from './users';

const userMap = new Map(users.map((user2) => [user2.email, user2]));

export function Comments({
  setComments,
}: {
  setComments: React.Dispatch<React.SetStateAction<UseCommentsReturnType>>;
}) {
  const fetchContacts = useFetchContacts();
  const retrieveUser = useRetrieveUser();

  const retrieveUserByEmailAddress = useCallback(
    function retrieveUserByEmailAddress(emailAddress: string): User | null {
      return userMap.get(emailAddress) ?? null;
    },
    []
  );

  const comments = useComments({ retrieveUser });

  const {
    thread,
    position: threadPosition,
    onAddThread,
    onSaveComment,
    onSubmitComment,
    onCancelCreateThread,
    onResolveThread,
  } = comments;

  useEffect(
    function setSetOnAddThread() {
      setComments(comments);
    },
    [comments, setComments]
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
