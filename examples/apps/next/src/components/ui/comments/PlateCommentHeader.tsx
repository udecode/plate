import React from 'react';
import {
  CommentUserName,
  useComment,
  useCommentsSelectors,
} from '@udecode/plate-comments';
import { cn } from '@udecode/plate-tailwind';
import { PlateAvatar } from './PlateAvatar';
import { PlateCommentResolveButton } from './PlateCommentResolveButton';

export function PlateCommentHeader() {
  const comment = useComment()!;

  const myUserId = useCommentsSelectors().myUserId();
  const isMyUser = myUserId === comment.userId;

  return (
    <div
      className={cn(
        'flex flex-row items-center rounded-t-lg border-b border-b-[rgb(218,220,224)] p-3',
        isMyUser
          ? 'bg-[#1a73e8] text-white'
          : 'bg-[#e8f0fe] text-[rgb(60,64,67)]'
      )}
    >
      <div className="mr-2 h-8 w-8 flex-none rounded-full bg-white">
        <PlateAvatar userId={comment.userId} />
      </div>

      <div className="flex-auto">
        <div className="text-xs">Author</div>

        <CommentUserName className="text-sm font-medium leading-5" />
      </div>

      <div className="flex-none">
        <PlateCommentResolveButton />
      </div>
    </div>
  );
}
