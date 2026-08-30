import { describe, expect, it } from 'bun:test';

import { createPluginContext, createEditor } from 'platejs';

describe('BaseSuggestionKit', () => {
  it('injects inline suggestion type for static inline element rendering', async () => {
    const { BaseSuggestionKit } = await import('./suggestion-static');

    const editor = createEditor({
      plugins: BaseSuggestionKit,
    });
    const suggestion = createPluginContext(editor, BaseSuggestionKit[0]);
    const transformProps = suggestion.inject?.nodeProps?.transformProps;

    if (!transformProps) throw new Error('Missing transformProps');

    expect(
      transformProps({
        ...suggestion,
        element: {
          children: [
            {
              suggestion_1: {
                createdAt: 0,
                id: 'suggestion-1',
                type: 'remove',
                userId: 'alice',
              },
              text: '',
            },
          ],
          type: 'date',
        },
        props: {},
      })
    ).toEqual({
      'data-inline-suggestion': 'remove',
    });
  });
});
