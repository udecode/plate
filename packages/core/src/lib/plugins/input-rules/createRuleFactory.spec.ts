import { createRuleFactory } from './createRuleFactory';

describe('createRuleFactory', () => {
  it('passes config defaults into block-start match resolvers when no public options are provided', () => {
    const rule = createRuleFactory<{}, { marker: string }>({
      type: 'blockStart',
      marker: '>',
      trigger: ' ',
      match: ({ marker }) => marker,
    })();

    const range = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };

    const match = rule.resolve?.({
      cause: 'insertText',
      editor: {} as any,
      getBlockEntry: () => {},
      getBlockStartRange: () => range as any,
      getBlockStartText: () => '>',
      getBlockTextBeforeSelection: () => '>',
      getCharAfter: () => {},
      getCharBefore: () => {},
      insertText: () => {},
      isCollapsed: true,
      options: undefined,
      pluginKey: 'blockquote',
      text: ' ',
    });

    expect(match).toEqual({ range, text: '>' });
  });

  it('merges base block-start match data with custom resolveMatch extras', () => {
    const rule = createRuleFactory<{}, {}, { start: number }>({
      type: 'blockStart',
      trigger: ' ',
      match: /^(\d+)\.$/,
      resolveMatch: ({ match }) => ({
        start: Number((match as RegExpMatchArray)[1]),
      }),
    })();

    const range = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    };

    const match = rule.resolve?.({
      cause: 'insertText',
      editor: {} as any,
      getBlockEntry: () => {},
      getBlockStartRange: () => range as any,
      getBlockStartText: () => '3.',
      getBlockTextBeforeSelection: () => '3.',
      getCharAfter: () => {},
      getCharBefore: () => {},
      insertText: () => {},
      isCollapsed: true,
      options: undefined,
      pluginKey: 'list',
      text: ' ',
    });

    expect(match).toEqual({ range, start: 3, text: '3.' });
  });
});
