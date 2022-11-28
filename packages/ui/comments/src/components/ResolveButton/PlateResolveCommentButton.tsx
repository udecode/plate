import React from 'react';
import { IconButton } from '@mui/material';
import { Check } from '@styled-icons/material';
import { useCommentsSelectors } from '@udecode/plate-comments';
import { ResolveButtonCommentRootProps } from './ResolveButtonCommentRoot';
import { ResolveCommentButton } from './ResolveCommentButton';
import { resolveButtonCss } from './styles';

export const PlateResolveCommentButton = (
  props: ResolveButtonCommentRootProps
) => {
  const { commentId } = props;

  const comment = useCommentsSelectors().comment(commentId);
  const currentUserId = useCommentsSelectors().currentUserId();

  return (
    <IconButton>
      <ResolveCommentButton.Root css={resolveButtonCss} {...props}>
        <Check
          size={22}
          color={currentUserId === comment.userId ? 'white' : 'default'}
        />
      </ResolveCommentButton.Root>
    </IconButton>
  );
};
