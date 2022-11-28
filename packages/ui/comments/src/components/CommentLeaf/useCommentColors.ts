import { useMemo } from 'react';
import {
  isCommentKey,
  TComment,
  TCommentText,
  useCommentsSelectors,
} from '@udecode/plate-comments';

export const useCommentColors = (
  node: TCommentText,
  {
    disabled,
  }: {
    disabled?: boolean;
  } = {}
) => {
  const activeComment = useCommentsSelectors().activeComment();

  const { active } = useMemo(() => {
    if (disabled) return {};

    return {
      active: Object.keys(node).some((key) => {
        if (isCommentKey(key)) {
          const comment = node[key] as TComment | undefined;

          return comment?.id === activeComment?.id;
        }
        return false;
      }),
    };
  }, [activeComment?.id, disabled, node]);

  // const commentCount = getCommentCount(node);

  // const opacity = active ? 0.56 : 0.14;
  const opacity = active ? 0.56 : 0.28;

  return {
    backgroundColor: `rgba(255,212,0, ${opacity})`,
    active,
  };
};
