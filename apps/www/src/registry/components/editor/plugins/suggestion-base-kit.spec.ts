import { afterAll, describe, expect, it, mock } from 'bun:test';
import { createPluginContext } from '@platejs/core/internal';
import { BaseSuggestionPlugin } from '@platejs/suggestion';
import { createBaseEditor } from 'platejs';

mock.module('@/registry/ui/suggestion-node-static', () => ({
  SuggestionLeafStatic: () => null,
  VoidRemoveSuggestionOverlayStatic: () => null,
}));

describe('BaseSuggestionKit', () => {
  afterAll(() => {
    mock.restore();
  });

  it('injects inline suggestion type for static inline element rendering', async () => {
    const { BaseSuggestionKit } = await import('./suggestion-base-kit');

    const editor = createBaseEditor({
      plugins: BaseSuggestionKit,
    });
    const suggestion = createPluginContext(editor, BaseSuggestionPlugin);
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
