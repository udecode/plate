import type { Value } from 'platejs';

export const discussionValue: Value = [
  {
    children: [{ text: 'Discussões' }],
    type: 'h2',
  },
  {
    children: [
      { text: 'Revise e refine o conteúdo perfeitamente. Use ' },
      {
        children: [
          {
            suggestion: true,
            suggestion_playground1: {
              id: 'playground1',
              createdAt: Date.now(),
              type: 'insert',
              userId: 'alice',
            },
            text: 'sugestões',
          },
        ],
        type: 'a',
        url: '/docs/suggestion',
      },
      {
        suggestion: true,
        suggestion_playground1: {
          id: 'playground1',
          createdAt: Date.now(),
          type: 'insert',
          userId: 'alice',
        },
        text: ' ',
      },
      {
        suggestion: true,
        suggestion_playground1: {
          id: 'playground1',
          createdAt: Date.now(),
          type: 'insert',
          userId: 'alice',
        },
        text: 'como este texto adicionado',
      },
      { text: ' ou para ' },
      {
        suggestion: true,
        suggestion_playground2: {
          id: 'playground2',
          createdAt: Date.now(),
          type: 'remove',
          userId: 'bob',
        },
        text: 'marcar texto para remoção',
      },
      { text: '. Discuta alterações usando ' },
      {
        children: [
          { comment: true, comment_discussion1: true, text: 'comentários' },
        ],
        type: 'a',
        url: '/docs/comment',
      },
      {
        comment: true,
        comment_discussion1: true,
        text: ' em muitos segmentos de texto',
      },
      { text: '. Você pode até ter ' },
      {
        comment: true,
        comment_discussion2: true,
        suggestion: true,
        suggestion_playground3: {
          id: 'playground3',
          createdAt: Date.now(),
          type: 'insert',
          userId: 'charlie',
        },
        text: 'anotações',
      },
      { text: ' sobrepostas!' },
    ],
    type: 'p',
  },
];
