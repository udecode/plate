'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import {
  CommentsPositioner,
  useFloatingCommentsContentState,
  useFloatingCommentsState,
} from '@udecode/plate-comments';
import { PortalBody } from '@udecode/plate-common';

import { CommentCreateForm } from './comment-create-form';
import { CommentReplyItems } from './comment-reply-items';
import { popoverVariants } from './popover';

export type FloatingCommentsContentProps = {
  disableForm?: boolean;
};

export function CommentsPopoverContent(props: FloatingCommentsContentProps) {
  const { disableForm } = props;

  const { activeCommentId, hasNoComment, myUserId, ref } =
    useFloatingCommentsContentState();

  return (
    <div className={cn(popoverVariants(), 'relative w-[310px]')} ref={ref}>
      {/* {!hasNoComment && ( */}
      {/* <CommentItem commentId={activeCommentId} key={activeCommentId} /> */}

      <CommentReplyItems commentId={activeCommentId!} />
      {/* )} */}

      {!!myUserId && !disableForm && <CommentCreateForm />}
    </div>
  );
}

export function CommentsPopover() {
  const { activeCommentId, loaded } = useFloatingCommentsState();

  if (!loaded || !activeCommentId) return null;

  return (
    <PortalBody>
      <CommentsPositioner className="absolute z-50 w-[418px] pb-4">
        <CommentsPopoverContent />
      </CommentsPositioner>
    </PortalBody>
  );
}
