import {
  createPrimitiveComponent,
  useEditorPlugin,
  usePluginOption,
} from '@udecode/plate/react';

import { type BaseCommentsConfig, unsetCommentNodesById } from '../../lib';
import { CommentsPlugin } from '../CommentsPlugin';
import { useCommentValue } from '../stores';

export const useCommentDeleteButton = () => {
  const { api, editor, setOption } = useEditorPlugin(CommentsPlugin);
  const activeCommentId = usePluginOption(CommentsPlugin, 'activeCommentId');
  const onCommentDelete = usePluginOption(
    CommentsPlugin,
    'onCommentDelete'
  ) as BaseCommentsConfig['options']['onCommentDelete'];
  const id = useCommentValue('id');

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
});
