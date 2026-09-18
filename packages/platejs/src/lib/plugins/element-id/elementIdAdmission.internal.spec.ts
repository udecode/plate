import { assertElementIds } from './elementIdAdmission.internal';

describe('assertElementIds', () => {
  it('uses one uniqueness domain across the primary and named roots', () => {
    expect(() =>
      assertElementIds({
        children: [
          {
            children: [{ text: 'main' }],
            id: 'shared',
            type: 'paragraph',
          },
        ],
        roots: {
          side: [
            {
              children: [{ text: 'side' }],
              id: 'shared',
              type: 'paragraph',
            },
          ],
        },
      })
    ).toThrow('Duplicate element ID "shared" at main:[0] and side:[0].');
  });

  it.each([
    ['', 'empty'],
    [42, 'numeric'],
  ])('rejects a %s element id', (id) => {
    expect(() =>
      assertElementIds({
        children: [{ children: [{ text: 'invalid' }], id, type: 'paragraph' }],
      })
    ).toThrow('Element ID at main:[0] must be a non-empty string.');
  });

  it('does not generate missing ids or mutate the document', () => {
    const document = {
      children: [{ children: [{ text: 'missing' }], type: 'paragraph' }],
    } as const;

    expect(() => assertElementIds(document)).not.toThrow();
    expect(document.children[0]).not.toHaveProperty('id');
  });
});
