import { TComment } from '@udecode/plate-comments';

import { MyValue } from '@/plate/plate.types';

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
    createdAt: 1663453625129,
  },
  2: {
    id: '2',
    userId: '1',
    value: [
      { type: 'p', children: [{ text: 'Can you review this one @12joan?' }] },
    ],
    createdAt: 1663453729191,
  },
  3: {
    id: '3',
    userId: '1',
    value: [{ type: 'p', children: [{ text: 'This is a resolved comment.' }] }],
    isResolved: true,
    createdAt: 1663453740180,
  },
  4: {
    id: '4',
    userId: '2',
    value: [{ type: 'p', children: [{ text: 'LGTM.' }] }],
    parentId: '2',
    createdAt: 1663453740181,
  },
  5: {
    id: '4',
    userId: '1',
    value: [{ type: 'p', children: [{ text: 'Thanks!' }] }],
    parentId: '2',
    createdAt: 1663453740182,
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
      { text: 'A line of text in a ' },
      {
        text: 'paragraph',
        comment: true,
        comment_1: true,
      },
      { text: '.' },
    ],
  },
  {
    type: 'p',
    children: [
      {
        text: 'Lorem',
        comment: true,
        comment_2: true,
      },
      // { text: 'amet' },
      // {
      //   text: 'paragraph',
      //   comment: true,
      //   comment_3: true,
      // },
      {
        text: ' consectetur, adipisicing elit. Nobis consequuntur modi odit incidunt unde animi molestias necessitatibus nisi ab optio dolorum, libero placeat aut, facere tempore accusamus veniam voluptatem aspernatur.',
      },
    ],
  },
  { type: 'p', children: [{ text: '' }] },
];
