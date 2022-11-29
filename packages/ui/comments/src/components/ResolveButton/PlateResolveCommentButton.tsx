import React from 'react';
import { IconButton } from '@mui/material';
import { Check } from '@styled-icons/material';
import { useCommentById, useCommentsSelectors } from '../CommentsProvider';
import {
  ResolveButtonCommentRootProps,
  ResolveCommentButton,
} from './ResolveCommentButton';
import { resolveButtonCss } from './styles';

export const PlateResolveCommentButton = (
  props: ResolveButtonCommentRootProps
) => {
  const comment = useCommentById(useCommentsSelectors().activeCommentId());
  const currentUserId = useCommentsSelectors().currentUserId();

  return (
    <IconButton>
      <ResolveCommentButton css={resolveButtonCss} {...props}>
        <Check
          size={22}
          color={currentUserId === comment?.userId ? 'white' : 'default'}
        />
      </ResolveCommentButton>
    </IconButton>
  );
};
