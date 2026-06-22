import type { Value } from '@platejs/slate';

import {
  STATIC_VALUE_CREATED_AT,
  normalizeStaticValue,
} from './normalizeStaticValue';

const getIds = (value: Value) => {
  const ids: string[] = [];

  const visit = (node: any) => {
    if (node?.id) ids.push(node.id);
    if (Array.isArray(node?.children)) {
      node.children.forEach(visit);
    }
  };

  value.forEach(visit);

  return ids;
};

describe('normalizeStaticValue', () => {
  it('produces stable ids and timestamps without mutating the input', () => {
    const input = [
      {
        children: [{ text: 'Intro' }],
        type: 'p',
      },
      {
        children: [
          {
            children: [
              {
                children: [
                  { children: [{ text: 'A1' }], type: 'th' },
                  { children: [{ text: 'B1' }], type: 'th' },
                ],
                type: 'tr',
              },
              {
                children: [
                  {
                    children: [
                      {
                        suggestion_demo: {
                          createdAt: 123,
                          id: 'suggestion-1',
                          type: 'insert',
                          userId: 'alice',
                        },
                        text: 'Cell',
                      },
                    ],
                    type: 'td',
                  },
                  { children: [{ text: 'Other' }], type: 'td' },
                ],
                type: 'tr',
              },
            ],
            type: 'tbody',
          },
        ],
        type: 'table',
      },
    ] as Value;

    const first = normalizeStaticValue(input);
    const second = normalizeStaticValue(input);
    const firstSuggestionNode = (first[1] as any).children[0].children[1]
      .children[0].children[0];

    expect(getIds(first)).toEqual(getIds(second));
    expect(firstSuggestionNode).toMatchObject({
      suggestion_demo: {
        createdAt: STATIC_VALUE_CREATED_AT,
        id: 'suggestion-1',
        type: 'insert',
        userId: 'alice',
      },
    });
    expect((input[0] as any).id).toBeUndefined();
    expect(
      (input[1] as any).children[0].children[1].children[0].children[0]
        .suggestion_demo.createdAt
    ).toBe(123);
  });
});
