import { TComment } from '@udecode/plate-comments';

import { MyValue } from '@/plate/plate-types';

export const usersData = {
  1: {
    id: '1',
    name: 'zbeyens',
    avatarUrl: 'https://avatars.githubusercontent.com/u/19695832?s=96&v=4',
  },
  2: {
    id: '2',
    name: '12joan',
    avatarUrl: 'https://avatars.githubusercontent.com/u/4272090?v=4',
  },
};

export const commentsData: Record<string, TComment> = {
  1: {
    id: '1',
    userId: '1',
    value: [{ type: 'p', children: [{ text: 'This is a comment.' }] }],
    createdAt: 1_663_453_625_129,
  },
  2: {
    id: '2',
    userId: '1',
    value: [
      { type: 'p', children: [{ text: 'Can you review this one @12joan?' }] },
    ],
    createdAt: 1_663_453_729_191,
  },
  3: {
    id: '3',
    userId: '1',
    value: [{ type: 'p', children: [{ text: 'This is a resolved comment.' }] }],
    isResolved: true,
    createdAt: 1_663_453_740_180,
  },
  4: {
    id: '4',
    userId: '2',
    value: [{ type: 'p', children: [{ text: 'LGTM.' }] }],
    parentId: '2',
    createdAt: 1_663_453_740_181,
  },
  5: {
    id: '4',
    userId: '1',
    value: [{ type: 'p', children: [{ text: 'Thanks!' }] }],
    parentId: '2',
    createdAt: 1_663_453_740_182,
  },
};

export const commentsValue: MyValue = [
  {
    type: 'h2',
    children: [{ text: '💬 Comments' }],
  },
  {
    type: 'p',
    children: [
      {
        text: 'Add ',
      },
      {
        text: 'comments to your content',
        comment: true,
        comment_1: true,
      },
      { text: ' to provide additional context, insights, or ' },
      {
        text: 'collaborate',
        comment: true,
        comment_2: true,
      },
      {
        text: '  with others',
      },
    ],
  },
];
