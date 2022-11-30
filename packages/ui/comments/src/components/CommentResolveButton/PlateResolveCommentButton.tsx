import React from 'react';
import { PlateButton } from '@udecode/plate-ui-button';
import { useComment } from '../CommentProvider';
import { CheckIcon } from './CheckIcon';
import { RefreshIcon } from './RefreshIcon';
import {
  ResolveButtonCommentProps,
  useResolveCommentButton,
} from './useResolveCommentButton';

export const PlateResolveCommentButton = (props: ResolveButtonCommentProps) => {
  const buttonProps = useResolveCommentButton(props);

  const comment = useComment()!;

  return (
    <PlateButton tw="p-1" {...buttonProps}>
      {comment.isResolved ? (
        <RefreshIcon tw="w-6 h-6 text-gray-500" />
      ) : (
        <CheckIcon tw="w-6 h-6 text-gray-500" />
      )}
    </PlateButton>
  );
};
