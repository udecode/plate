'use client';

import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';

// Replace to your own backend or refer to potion
export const mockUsers = [
  {
    id: '1',
    avatarUrl: 'https://avatars.githubusercontent.com/u/19695832?s=96&v=4',
    name: 'zbeyens',
  },
  {
    id: '2',
    avatarUrl: 'https://avatars.githubusercontent.com/u/4272090?v=4',
    name: '12joan',
  },
];

export function CommentAvatar({ userId }: { userId: string | null }) {
  const user = mockUsers.find((user) => user.id === userId);

  return (
    <Avatar className="size-6">
      <AvatarImage alt={user?.name} src={user?.avatarUrl} />
      <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
    </Avatar>
  );
}
