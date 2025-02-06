import React from 'react';

import { useEditorPlugin, usePluginOption } from '@udecode/plate/react';

import {
  type TCommentText,
  getCommentKeyId,
  isCommentKey,
  unsetCommentNodesById,
} from '../../lib';
import { CommentsPlugin } from '../CommentsPlugin';

export const useCommentLeafState = ({ leaf }: { leaf: TCommentText }) => {
  const { editor, setOption } = useEditorPlugin(CommentsPlugin);

  const [commentIds, setCommentIds] = React.useState<string[]>([]);
  const activeCommentId = usePluginOption(CommentsPlugin, 'activeCommentId');
  const comments = usePluginOption(CommentsPlugin, 'comments');
  const [commentCount, setCommentCount] = React.useState(1);
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    const ids: string[] = [];
    let count = 0;

    let _isActive = false;

    Object.keys(leaf).forEach((key) => {
      if (!isCommentKey(key)) return;

      const id = getCommentKeyId(key);

      if (comments[id]?.isResolved) return;
      if (id === activeCommentId) {
        _isActive = true;
        setIsActive(true);
      }

      ids.push(getCommentKeyId(key));
      count++;
    });

    if (!_isActive && isActive) {
      setIsActive(false);

      // Remove comment nodes for unsubmitted comments
      ids.forEach((id) => {
        if (!comments[id]) {
          unsetCommentNodesById(editor, { id });
        }
      });
    }

    setCommentCount(count);
    setCommentIds(ids);
  }, [editor, activeCommentId, comments, isActive, leaf]);

  const lastCommentId = commentIds.at(-1)!;

  return {
    commentCount,
    isActive,
    lastCommentId,
    setOption,
  };
};

export const useCommentLeaf = ({
  lastCommentId,
  setOption,
}: ReturnType<typeof useCommentLeafState>) => {
  return {
    props: {
      onClick: React.useCallback(
        (e: MouseEvent) => {
          e.stopPropagation();
          setOption('activeCommentId', lastCommentId);
        },
        [lastCommentId, setOption]
      ),
    },
  };
};
