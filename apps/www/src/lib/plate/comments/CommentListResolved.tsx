import React from 'react';
import { useCommentsResolved } from '@udecode/plate-comments';
import { CommentItem } from './CommentItem';

// !HEADLESS

export function CommentListResolved() {
  const resolvedComments = useCommentsResolved();

  return (
    <div className="w-[500px]">
      <h2 className="my-0 flex-none border-b border-b-[rgb(218,220,224)] p-4 text-base font-medium">
        Resolved comments
      </h2>
      <div className="flex-auto overflow-y-auto p-4 [&_>_*]:mb-4 [&_>_*]:last:mb-0">
        {resolvedComments.map((comment) => (
          <CommentItem key={comment.id} commentId={comment.id} />
        ))}
      </div>
    </div>
  );
}
