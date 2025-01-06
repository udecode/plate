import React from 'react';

import { useEditorPlugin, useEditorVersion } from '@udecode/plate/react';

import { BaseCommentsPlugin } from '../../lib/BaseCommentsPlugin';

export const useFloatingCommentsState = () => {
  const { api, editor, setOption, useOption } =
    useEditorPlugin(BaseCommentsPlugin);
  const version = useEditorVersion();

  const activeCommentId = useOption('activeCommentId');

  const [loaded, setLoaded] = React.useState(false);
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    // there is a delay between activeCommentId and someNode, so we sync in `active`
    if (
      activeCommentId &&
      editor.api.some({
        match: (n) => n[BaseCommentsPlugin.key],
      })
    ) {
      setActive(true);
    }
    if (!editor.api.some({ match: (n) => n[BaseCommentsPlugin.key] })) {
      setOption('activeCommentId', null);
      setActive(false);
    }
  }, [active, activeCommentId, editor, setOption, version]);

  React.useEffect(() => {
    setLoaded(true);
  }, []);

  // reset comment editing value when active comment id changes
  React.useEffect(() => {
    if (activeCommentId) {
      api.comment.resetNewCommentValue();
    }
  }, [activeCommentId, api.comment]);

  return {
    activeCommentId,
    loaded,
  };
};
