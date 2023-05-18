import React from 'react';
import {
  AccountCircleIcon,
  AvatarImage,
  useUserById,
} from '@udecode/plate-comments';

export function PlateAvatar({ userId }: { userId: string | null }) {
  const user = useUserById(userId);
  if (!user) return null;

  return (
    <div className="relative left-0 block aspect-[auto_32_/_32] h-8 w-8 cursor-default select-text whitespace-nowrap rounded-full object-cover text-left text-sm font-normal text-black [-webkit-tap-highlight-color:rgba(0,0,0,0)]">
      {user.avatarUrl ? (
        <AvatarImage
          className="h-8 w-8 cursor-default select-text whitespace-nowrap rounded-full text-left text-sm font-normal text-black [-webkit-tap-highlight-color:rgba(0,0,0,0)]"
          userId={userId!}
        />
      ) : (
        <AccountCircleIcon
          className="h-8 w-8 cursor-default select-text whitespace-nowrap text-left text-sm font-normal text-gray-500 [-webkit-tap-highlight-color:rgba(0,0,0,0)]"
          viewBox="0 0 24 24"
        />
      )}
    </div>
  );
}
