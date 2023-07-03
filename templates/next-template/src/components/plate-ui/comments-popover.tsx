'use client';

import React from 'react';
import {
  CommentProvider,
  CommentsPositioner,
  SCOPE_ACTIVE_COMMENT,
  useFloatingCommentsContentState,
  useFloatingCommentsState,
} from '@udecode/plate-comments';
import { PortalBody } from '@udecode/plate-common';

import { cn } from '@/lib/utils';
import { popoverVariants } from '@/components/plate-ui/popover';

import { CommentCreateForm } from './comment-create-form';
import { CommentItem } from './comment-item';
import { CommentReplyItems } from './comment-reply-items';

export type FloatingCommentsContentProps = {
  disableForm?: boolean;
};

export function CommentsPopoverContent(props: FloatingCommentsContentProps) {
  const { disableForm } = props;

  const { ref, activeCommentId, hasNoComment, myUserId } =
    useFloatingCommentsContentState();

  return (
    <CommentProvider
      key={activeCommentId}
      id={activeCommentId}
      scope={SCOPE_ACTIVE_COMMENT}
    >
      <div ref={ref} className={cn(popoverVariants(), 'relative w-[310px]')}>
        {!hasNoComment && (
          <>
            <CommentItem key={activeCommentId} commentId={activeCommentId} />

            <CommentReplyItems />
          </>
        )}

        {!!myUserId && !disableForm && <CommentCreateForm />}
      </div>
    </CommentProvider>
  );
}

export function CommentsPopover() {
  const { loaded, activeCommentId } = useFloatingCommentsState();

  if (!loaded || !activeCommentId) return null;

  return (
    <PortalBody>
      <CommentsPositioner className="absolute z-50 w-[418px] pb-4">
        <CommentsPopoverContent />
      </CommentsPositioner>
    </PortalBody>
  );
}
