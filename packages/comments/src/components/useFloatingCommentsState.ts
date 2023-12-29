import React from 'react';
import {
  someNode,
  useEditorRef,
  useEditorVersion,
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
  const editor = useEditorRef();
  const version = useEditorVersion();

  const [loaded, setLoaded] = React.useState(false);

  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
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
  }, [active, activeCommentId, editor, version, setActiveCommentId]);

  React.useEffect(() => {
    setLoaded(true);
  }, []);

  // reset comment editing value when active comment id changes
  React.useEffect(() => {
    if (activeCommentId) {
      resetNewCommentValue();
    }
  }, [activeCommentId, resetNewCommentValue]);

  return {
    loaded,
    activeCommentId,
  };
};
