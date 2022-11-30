import React from 'react';
import { IconButton } from '@mui/material';
import { Check } from '@styled-icons/material';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { useCommentById, useCommentsSelectors } from '../CommentsProvider';
import {
  ResolveButtonCommentRootProps,
  ResolveCommentButton,
} from './ResolveCommentButton';

export const resolveButtonCss = css`
  ${tw`w-full h-full`}
`;

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
