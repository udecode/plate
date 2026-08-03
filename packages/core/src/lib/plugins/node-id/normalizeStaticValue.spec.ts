import type { EditorDocumentValue, Value } from '@platejs/plite';

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
        type: 'paragraph',
      },
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [{ text: 'A1' }],
                    header: true,
                    type: 'tableCell',
                  },
                  {
                    children: [{ text: 'B1' }],
                    header: true,
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
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
                    type: 'tableCell',
                  },
                  { children: [{ text: 'Other' }], type: 'tableCell' },
                ],
                type: 'tableRow',
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

  it('normalizes the primary and named roots as one static document', () => {
    const input = {
      children: [
        {
          childRoots: { caption: 'caption:1' },
          children: [{ text: '' }],
          type: 'media',
        },
      ],
      meta: { createdAt: 123 },
      roots: {
        'caption:1': [
          {
            children: [
              {
                suggestion_demo: {
                  createdAt: 456,
                  id: 'suggestion-1',
                  type: 'insert',
                  userId: 'alice',
                },
                text: 'Caption',
              },
            ],
            type: 'paragraph',
          },
        ],
      },
    } satisfies EditorDocumentValue;

    const first = normalizeStaticValue(input);
    const second = normalizeStaticValue(input);
    const firstIds = [
      ...getIds(first.children),
      ...getIds(first.roots['caption:1']),
    ];

    expect(firstIds).toEqual(['static-0001', 'static-0002']);
    expect(firstIds).toEqual([
      ...getIds(second.children),
      ...getIds(second.roots['caption:1']),
    ]);
    expect(first).toMatchObject({
      meta: { createdAt: STATIC_VALUE_CREATED_AT },
      roots: {
        'caption:1': [
          {
            children: [
              {
                suggestion_demo: {
                  createdAt: STATIC_VALUE_CREATED_AT,
                },
              },
            ],
          },
        ],
      },
    });
    expect(input.children[0]).not.toHaveProperty('id');
    expect(input.roots['caption:1'][0]).not.toHaveProperty('id');
    expect(input.meta.createdAt).toBe(123);
  });
});
