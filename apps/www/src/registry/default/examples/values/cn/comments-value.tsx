import type { Value } from '@udecode/plate';
export const commentsValue: Value = [
  {
    children: [{ text: '评论和建议' }],
    type: 'h2',
  },
  {
    children: [
      {
        text: '为',
      },
      {
        comment: true,
        comment_discussion1: true,
        text: '您的内容添加评论',
      },
      {
        text: '以提供额外',
      },
      {
        text: '的上下文、',
      },
      {
        suggestion: true,
        suggestion_suggestion1: {
          id: 'suggestion1',
          createdAt: Date.now(),
          type: 'remove',
          userId: 'user3',
        },
        text: '见解',
      },
      {
        suggestion: true,
        suggestion_suggestion1: {
          id: 'suggestion1',
          createdAt: Date.now(),
          type: 'insert',
          userId: 'user3',
        },
        text: '建议',
      },
      {
        text: '，或者',
      },
      {
        comment: true,
        comment_discussion2: true,
        text: '协作',
      },
      {
        text: '与他人',
      },
    ],
    type: 'p',
  },
];
