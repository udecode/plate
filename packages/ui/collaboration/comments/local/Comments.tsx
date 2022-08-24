import React, { useCallback, useEffect } from 'react';
import { User } from '@xolvio/plate-comments';
import { SideThread, useComments, UseCommentsReturnType } from '../src';
import { useFetchContacts, users } from './useFetchContacts';
import { useRetrieveUser } from './useRetrieveUser';

const userMap = new Map(users.map((user2) => [user2.email, user2]));

export function Comments({
  setComments,
}: {
  setComments: React.Dispatch<
    React.SetStateAction<UseCommentsReturnType | null>
  >;
}) {
  const fetchContacts = useFetchContacts();
  const retrieveUser = useRetrieveUser();

  const retrieveUserByEmailAddress = useCallback(
    (emailAddress: string): User | null => {
      return userMap.get(emailAddress) ?? null;
    },
    []
  );

  const comments = useComments({ retrieveUser });

  const {
    thread,
    position: threadPosition,
    // onAddThread,
    onSaveComment,
    onSubmitComment,
    onCancelCreateThread,
    onResolveThread,
  } = comments;

  useEffect(() => {
    setComments?.(comments);
  }, [comments, setComments]);

  if (thread)
    return (
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
    );
  return null;
}
