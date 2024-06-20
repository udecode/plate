import type { TComments } from '@udecode/plate-comments';
import type { Value } from '@udecode/plate-common';

export const usersData = {
  1: {
    avatarUrl: 'https://avatars.githubusercontent.com/u/19695832?s=96&v=4',
    id: '1',
    name: 'zbeyens',
  },
  2: {
    avatarUrl: 'https://avatars.githubusercontent.com/u/4272090?v=4',
    id: '2',
    name: '12joan',
  },
};

export const commentsData: TComments[] = [
  {
    createdAt: 1_663_453_729_191,
    id: 'comments_1',
    isResolved: false,
    replies: [
      {
        commentsId: 'comments_1',
        createdAt: 1_663_453_729_191,
        id: 'reply_1',
        isUpdated: false,
        updatedAt: 1_663_453_729_191,
        userId: '1',
        value: [
          { children: [{ text: 'zbeyens: This is a comment.' }], type: 'p' },
        ],
      },
      {
        commentsId: 'comments_1',
        createdAt: 1_663_453_729_191,
        id: 'reply_2',
        isUpdated: false,
        updatedAt: 1_663_453_729_191,
        userId: '1',
        value: [
          { children: [{ text: 'zbeyens: This is a comment.' }], type: 'p' },
        ],
      },
    ],
    updatedAt: 1_663_453_729_191,
  },
  {
    createdAt: 1_663_453_729_191,
    id: 'comments_2',
    isResolved: false,
    replies: [
      {
        commentsId: 'comments_2',
        createdAt: 1_663_453_729_191,
        id: 'reply_3',
        isUpdated: false,
        updatedAt: 1_663_453_729_191,
        userId: '2',
        value: [{
          children: [
            { text: 'Joe: A commen' },
            { italic: true, text: 't' },
            { text: 'able effort' },
          ],
          type: 'p',
        }],
      },
    ],
    updatedAt: 1_663_453_729_191,
  },
];

export const commentsValue: Value = [
  {
    children: [{ text: '💬 Comments' }],
    type: 'h2',
  },
  {
    children: [
      {
        text: 'Add ',
      },
      {
        comment: true,
        comment_comments_1: true,
        text: 'comments to your content',
      },
      { text: ' to provide additional context, insights, or ' },
      {
        comment: true,
        comment_comments_2: true,
        text: 'collaborate',
      },
      {
        text: '  with others',
      },
    ],
    type: 'p',
  },
];
