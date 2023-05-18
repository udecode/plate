import React from 'react';
import {
  CommentProvider,
  SCOPE_ACTIVE_COMMENT,
  useFloatingCommentsContentState,
} from '@udecode/plate-comments';
import { PlateComment } from './PlateComment';
import { PlateCommentNewForm } from './PlateCommentNewForm';
import { PlateCommentReplies } from './PlateCommentReplies';

export type PlateFloatingCommentsContentProps = {
  disableForm?: boolean;
};

export function PlateFloatingCommentsContent(
  props: PlateFloatingCommentsContentProps
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
      <div
        ref={ref}
        className="flex flex-col space-y-2 rounded-lg border border-white bg-white p-3 shadow-[0_2px_6px_2px_rgb(60_64_67_/_15%)]"
      >
        {!hasNoComment && (
          <>
            <PlateComment key={activeCommentId} commentId={activeCommentId} />

            <PlateCommentReplies />
          </>
        )}

        {!!myUserId && !disableForm && <PlateCommentNewForm />}
      </div>
    </CommentProvider>
  );
}
