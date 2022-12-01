import { useEffect, useState } from 'react';
import { useCommentsSelectors, useResetNewCommentValue } from '../stores/index';

export const useFloatingCommentsState = () => {
  const activeCommentId = useCommentsSelectors().activeCommentId();
  const resetNewCommentValue = useResetNewCommentValue();

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // reset comment editing value when active comment id changes
  useEffect(() => {
    if (activeCommentId) {
      resetNewCommentValue();
    }
  }, [activeCommentId, resetNewCommentValue]);

  return {
    loaded,
    activeCommentId,
  };
};
