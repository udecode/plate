import React from 'react';

import { useEditorPlugin, usePluginOption } from '@udecode/plate/react';

import { CommentsPlugin } from '../CommentsPlugin';

export const useCommentAddButton = () => {
  const { setOption, tf } = useEditorPlugin(CommentsPlugin);

  const myUserId = usePluginOption(CommentsPlugin, 'myUserId');

  const onClick = React.useCallback<React.MouseEventHandler<HTMLSpanElement>>(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      tf.insert.comment();
      setOption('focusTextarea', true);
    },
    [setOption, tf.insert]
  );

  return {
    hidden: !myUserId,
    props: { onClick },
  };
};
