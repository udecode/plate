'use client';

import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';

const mockUsers = {
  1: {
    id: '1',
    avatarUrl: 'https://avatars.githubusercontent.com/u/19695832?s=96&v=4',
    name: 'zbeyens',
  },
  2: {
    id: '2',
    avatarUrl: 'https://avatars.githubusercontent.com/u/4272090?v=4',
    name: '12joan',
  },
};

export function CommentAvatar({ userId }: { userId: string | null }) {
  return (
    <Avatar className="size-6">
      <AvatarImage alt={mockUsers[1].name} src={mockUsers[1].avatarUrl} />
      <AvatarFallback>{mockUsers[1].name?.[0]}</AvatarFallback>
    </Avatar>
  );
}
