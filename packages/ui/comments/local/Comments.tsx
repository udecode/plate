import React, { useEffect } from 'react';
import { useComments } from '../src/hooks/useComments';

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

  return null;
};
