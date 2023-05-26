import React from 'react';
import {
  CommentProvider,
  SCOPE_ACTIVE_COMMENT,
  useFloatingCommentsContentState,
} from '@udecode/plate-comments';
import { CommentCreateForm } from './CommentCreateForm';
import { CommentItem } from './CommentItem';
import { CommentReplyItems } from './CommentReplyItems';

import { popoverVariants } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type FloatingCommentsContentProps = {
  disableForm?: boolean;
};

export function FloatingCommentListContent(
  props: FloatingCommentsContentProps
) {
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
