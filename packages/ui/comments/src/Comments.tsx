import React, { useEffect } from 'react';
import { PlateSideThread } from './components/SideThread/PlateSideThread';
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

  const retrieveUserByEmail = (email: string) => {
    return [user].find((u) => u.email === email);
  };

  if (commentActions.thread) {
    return (
      <>
        <PlateSideThread
          fetchContacts={() => [user]}
          onCancel={commentActions.onCancelCreateThread}
          onResolveThread={commentActions.onResolveThread}
          onSave={commentActions.onSaveComment}
          onSubmitComment={commentActions.onSubmitComment}
          position={commentActions.position}
          retrieveUser={retrieveUser}
          retrieveUserByEmail={retrieveUserByEmail}
          thread={commentActions.thread}
          hideThread={commentActions.hideThread}
        />
      </>
    );
  }

  return null;
};
