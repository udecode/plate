import { afterAll, describe, expect, it, mock } from 'bun:test';

mock.module('@platejs/suggestion', () => ({
  BaseSuggestionPlugin: {
    configure: (config: any) => config,
  },
}));

mock.module('platejs', () => ({
  KEYS: {
    date: 'date',
    inlineEquation: 'inline_equation',
    link: 'link',
    mention: 'mention',
  },
  TextApi: {
    isText: (node: any) => typeof node?.text === 'string',
  },
}));

mock.module('@/registry/ui/suggestion-node-static', () => ({
  SuggestionLeafStatic: () => null,
  VoidRemoveSuggestionOverlayStatic: () => null,
}));

describe('BaseSuggestionKit', () => {
  afterAll(() => {
    mock.restore();
  });

  it('injects inline suggestion type for static inline element rendering', async () => {
    const { BaseSuggestionKit } = await import(
      `./suggestion-base-kit?test=${Math.random().toString(36).slice(2)}`
    );

    const transformProps = (BaseSuggestionKit[0] as any).inject.nodeProps
      .transformProps;
    const editor = {
      getApi: () => ({
        suggestion: {
          dataList: (node: any) =>
            Object.keys(node)
              .filter((key) => key.startsWith('suggestion_'))
              .map((key) => node[key]),
          suggestionData: (element: any) => element.suggestion,
        },
      }),
    };

    expect(
      transformProps({
        editor,
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
