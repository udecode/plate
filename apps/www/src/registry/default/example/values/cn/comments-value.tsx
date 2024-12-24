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
    value: [{ children: [{ text: '这是一条评论。' }], type: 'p' }],
  },
  2: {
    id: '2',
    createdAt: 1_663_453_729_191,
    userId: '1',
    value: [{ children: [{ text: '你能帮我看看这个吗 @12joan?' }], type: 'p' }],
  },
  3: {
    id: '3',
    createdAt: 1_663_453_740_180,
    isResolved: true,
    userId: '1',
    value: [{ children: [{ text: '这是一条已解决的评论。' }], type: 'p' }],
  },
  4: {
    id: '4',
    createdAt: 1_663_453_740_181,
    parentId: '2',
    userId: '2',
    value: [{ children: [{ text: '看起来不错。' }], type: 'p' }],
  },
  5: {
    id: '4',
    createdAt: 1_663_453_740_182,
    parentId: '2',
    userId: '1',
    value: [{ children: [{ text: '谢谢！' }], type: 'p' }],
  },
};

export const commentsValue: Value = [
  {
    children: [{ text: '评论' }],
    type: 'h2',
  },
  {
    children: [
      {
        text: '为您的内容添加',
      },
      {
        comment: true,
        comment_1: true,
        text: '评论',
      },
      { text: '以提供额外的上下文、见解或' },
      {
        comment: true,
        comment_2: true,
        text: '与他人协作',
      },
      {
        text: '',
      },
    ],
    type: 'p',
  },
];
