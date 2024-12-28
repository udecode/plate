import type { Value } from '@udecode/plate-common';

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
