import {
  createPrimitiveComponent,
  useEditorPlugin,
} from '@udecode/plate-common/react';

import { type CommentsConfig, unsetCommentNodesById } from '../../lib';
import { CommentsPlugin } from '../CommentsPlugin';
import { useCommentSelectors } from '../stores/comment/CommentProvider';

export const useCommentDeleteButtonState = () => {
  const { api, editor, setOption, useOption } = useEditorPlugin(CommentsPlugin);

  const activeCommentId = useOption('activeCommentId');
  const onCommentDelete = useOption(
    'onCommentDelete'
  ) as CommentsConfig['options']['onCommentDelete'];
  const id = useCommentSelectors().id();

  return {
    activeCommentId,
    api,
    editor,
    id,
    onCommentDelete,
    setOption,
  };
};

export const useCommentDeleteButton = ({
  activeCommentId,
  api,
  editor,
  id,
  onCommentDelete,
  setOption,
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
