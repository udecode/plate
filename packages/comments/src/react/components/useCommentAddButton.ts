import React from 'react';

import { useEditorPlugin } from '@udecode/plate-common/react';

import { CommentsPlugin } from '../CommentsPlugin';

export const useCommentAddButton = () => {
  const { setOption, tf, useOption } = useEditorPlugin(CommentsPlugin);

  const myUserId = useOption('myUserId');

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
