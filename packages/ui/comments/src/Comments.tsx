import React, { useEffect } from 'react';
import { PlateSideThread } from './components';
import { useComments } from './hooks';

const user = {
  id: '1',
  name: 'John Doe',
  email: 'osama@gmail.com',
  avatarUrl: 'https://avatars.githubusercontent.com/u/1863771?v=4',
};

const retrieveUser = () => user;

export const Comments = (props: any) => {
  const { setCommentActions } = props;
  const commentActions = useComments({ retrieveUser });

  useEffect(() => {
    setCommentActions(commentActions);
  }, [commentActions, setCommentActions]);

  const retrieveUserByEmailAddress = (email: string) => {
    const foundUser = [user].find((u) => u.email === email);
    if (foundUser) {
      return foundUser;
    }
    return null;
  };

  if (commentActions.thread) {
    return (
      <>
        <PlateSideThread
          thread={commentActions.thread}
          position={commentActions.position}
          onSaveComment={commentActions.onSaveComment}
          onSubmitComment={commentActions.onSubmitComment}
          onCancelCreateThread={commentActions.onCancelCreateThread}
          onResolveThread={commentActions.onResolveThread}
          fetchContacts={() => [user]}
          retrieveUser={retrieveUser}
          retrieveUserByEmailAddress={retrieveUserByEmailAddress}
        />
      </>
    );
  }

  return null;
};
