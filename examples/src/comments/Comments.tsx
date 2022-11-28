import React, { useEffect, useState } from 'react';
import { commentsActions } from '@udecode/plate-comments';
import { PlateFloatingComments } from '@udecode/plate-ui-comments';
import { commentsData, usersData } from './constants';

export const Comments = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    commentsActions.comments(commentsData);
    commentsActions.users(usersData);

    setLoaded(true);
  }, []);

  if (!loaded) return null;

  return <PlateFloatingComments />;
};
