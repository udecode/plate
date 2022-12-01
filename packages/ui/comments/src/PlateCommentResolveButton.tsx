import React from 'react';
import {
  CheckIcon,
  CommentResolveButton,
  RefreshIcon,
  useComment,
} from '@udecode/plate-comments';
import { plateButtonCss } from '@udecode/plate-ui-button';
import tw from 'twin.macro';

export const PlateCommentResolveButton = () => {
  const comment = useComment()!;

  return (
    <CommentResolveButton css={[plateButtonCss, tw`p-1`]}>
      {comment.isResolved ? (
        <RefreshIcon tw="w-6 h-6 text-gray-500" />
      ) : (
        <CheckIcon tw="w-6 h-6 text-gray-500" />
      )}
    </CommentResolveButton>
  );
};
