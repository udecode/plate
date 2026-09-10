import type { Value } from 'platejs';

const createdAt = new Date('2026-09-02T10:00:00Z').getTime();

export const suggestionValue: Value = [
  {
    children: [
      { text: 'Reviewers can ' },
      {
        suggestion: true,
        suggestion_tighten: {
          id: 'tighten',
          createdAt,
          type: 'insert',
          userId: 'alice',
        },
        text: 'tighten the wording',
      },
      { text: ' or ' },
      {
        suggestion: true,
        suggestion_remove: {
          id: 'remove',
          createdAt: createdAt + 1,
          type: 'remove',
          userId: 'bob',
        },
        text: 'keep this redundant phrase',
      },
      { text: '. Add comments from the toolbar or press Mod+Shift+M.' },
    ],
    type: 'paragraph',
  },
];
