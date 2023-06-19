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

  const [active, setActive] = useState(false);

  useEffect(() => {
    // there is a delay between activeCommentId and someNode, so we sync in `active`
    if (
      activeCommentId &&
      someNode(editor, {
        match: (n) => n[MARK_COMMENT],
      })
    ) {
      setActive(true);
    }

    if (!someNode(editor, { match: (n) => n[MARK_COMMENT] })) {
      setActiveCommentId(null);
      setActive(false);
    }
  }, [active, activeCommentId, editor, key, setActiveCommentId]);

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
