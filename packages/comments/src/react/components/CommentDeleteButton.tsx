import {
  createPrimitiveComponent,
  useEditorPlugin,
  useStoreValue,
} from '@udecode/plate/react';

import { type BaseCommentsConfig, unsetCommentNodesById } from '../../lib';
import { CommentsPlugin } from '../CommentsPlugin';
import { useCommentStore } from '../stores';

export const useCommentDeleteButtonState = () => {
  const { api, editor, setOption, useOption } = useEditorPlugin(CommentsPlugin);

  const activeCommentId = useOption('activeCommentId');
  const onCommentDelete = useOption(
    'onCommentDelete'
  ) as BaseCommentsConfig['options']['onCommentDelete'];
  const id = useStoreValue(useCommentStore(), 'id');

  return {
    id,
    activeCommentId,
    api,
    editor,
    setOption,
    onCommentDelete,
  };
};

export const useCommentDeleteButton = ({
  id,
  activeCommentId,
  api,
  editor,
  setOption,
  onCommentDelete,
}: ReturnType<typeof useCommentDeleteButtonState>) => {
  return {
    props: {
      onClick: () => {
        if (activeCommentId === id) {
          unsetCommentNodesById(editor, { id });
          setOption('activeCommentId', null);
        } else {
          api.comment.removeComment(id);
        }

        onCommentDelete?.(id);
      },
    },
  };
};

export const CommentDeleteButton = createPrimitiveComponent('button')({
  propsHook: useCommentDeleteButton,
  stateHook: useCommentDeleteButtonState,
});
