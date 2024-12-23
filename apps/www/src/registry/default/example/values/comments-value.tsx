import type { TComment } from '@udecode/plate-comments';
import type { Value } from '@udecode/plate-common';

export const usersData = {
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

export const commentsData: Record<string, TComment> = {
  1: {
    id: '1',
    createdAt: 1_663_453_625_129,
    userId: '1',
    value: [{ children: [{ text: 'This is a comment.' }], type: 'p' }],
  },
  2: {
    id: '2',
    createdAt: 1_663_453_729_191,
    userId: '1',
    value: [
      { children: [{ text: 'Can you review this one @12joan?' }], type: 'p' },
    ],
  },
  3: {
    id: '3',
    createdAt: 1_663_453_740_180,
    isResolved: true,
    userId: '1',
    value: [{ children: [{ text: 'This is a resolved comment.' }], type: 'p' }],
  },
  4: {
    id: '4',
    createdAt: 1_663_453_740_181,
    parentId: '2',
    userId: '2',
    value: [{ children: [{ text: 'LGTM.' }], type: 'p' }],
  },
  5: {
    id: '4',
    createdAt: 1_663_453_740_182,
    parentId: '2',
    userId: '1',
    value: [{ children: [{ text: 'Thanks!' }], type: 'p' }],
  },
};

export const commentsValue: Value = [
  {
    children: [{ text: 'Comments' }],
    type: 'h2',
  },
  {
    children: [
      {
        text: 'Add ',
      },
      {
        comment: true,
        comment_1: true,
        text: 'comments to your content',
      },
      { text: ' to provide additional context, insights, or ' },
      {
        comment: true,
        comment_2: true,
        text: 'collaborate',
      },
      {
        text: '  with others',
      },
    ],
    type: 'p',
  },
];
