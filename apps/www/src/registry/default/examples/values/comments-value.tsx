import type { Value } from '@udecode/plate';

export const commentsValue: Value = [
  {
    children: [{ text: 'Comments and suggestions' }],
    type: 'h2',
  },
  {
    children: [
      {
        text: 'Add ',
      },
      {
        comment: true,
        comment_discussion1: true,
        text: 'comments to your content',
      },
      {
        text: ' to provide additio',
      },
      {
        text: 'nal context, ',
      },
      {
        suggestion: true,
        suggestion_suggestion1: {
          id: 'suggestion1',
          createdAt: Date.now(),
          type: 'remove',
          userId: 'user3',
        },
        text: 'insights',
      },
      {
        suggestion: true,
        suggestion_suggestion1: {
          id: 'suggestion1',
          createdAt: Date.now(),
          type: 'insert',
          userId: 'user3',
        },
        text: 'suggesions',
      },
      {
        text: ', or ',
      },
      {
        comment: true,
        comment_discussion2: true,
        text: 'collaborate',
      },
      {
        text: ' with others',
      },
    ],
    type: 'p',
  },
];
