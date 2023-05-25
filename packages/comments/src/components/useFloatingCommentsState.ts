import { useEffect, useState } from 'react';
import {
  someNode,
  usePlateEditorRef,
  usePlateSelectors,
} from '@udecode/plate-common';
import { MARK_COMMENT } from '../constants';
import {
  useCommentsActions,
  useCommentsSelectors,
  useResetNewCommentValue,
} from '../stores/index';

export const useFloatingCommentsState = () => {
  const activeCommentId = useCommentsSelectors().activeCommentId();
  const resetNewCommentValue = useResetNewCommentValue();
  const setActiveCommentId = useCommentsActions().activeCommentId()!;
  const editor = usePlateEditorRef();
  const key = usePlateSelectors().keyEditor();

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (
      activeCommentId &&
      !someNode(editor, { match: (n) => n[MARK_COMMENT] })
    ) {
      setActiveCommentId(null);
    }
  }, [activeCommentId, editor, key, setActiveCommentId]);

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
