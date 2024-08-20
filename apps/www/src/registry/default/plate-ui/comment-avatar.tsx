'use client';

import React from 'react';

import { useUserById } from '@udecode/plate-comments/react';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';

export function CommentAvatar({ userId }: { userId: null | string }) {
  const user = useUserById(userId);

  if (!user) return null;

  return (
    <Avatar className="size-5">
      <AvatarImage alt={user.name} src={user.avatarUrl} />
      <AvatarFallback>{user.name?.[0]}</AvatarFallback>
    </Avatar>
  );
}
