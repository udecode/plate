import { BaseParagraphPlugin, createSlateEditor } from 'platejs';

import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';
import { getTransientSuggestionKey } from './utils/getTransientSuggestionKey';

describe('BaseSuggestionPlugin', () => {
  const inlineSuggestion = {
    createdAt: 1,
    id: 'inline',
    type: 'insert' as const,
    userId: 'alice',
  };
  const blockSuggestion = {
    createdAt: 2,
    id: 'block',
    type: 'remove' as const,
    userId: 'alice',
  };

  const createEditor = () =>
    createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseSuggestionPlugin],
      value: [
        {
          children: [
            {
              suggestion: true,
              suggestion_inline: inlineSuggestion,
              text: 'inline',
            },
          ],
          type: 'p',
        },
        {
          children: [{ text: 'block' }],
          suggestion: blockSuggestion,
          type: 'p',
        },
        {
          children: [
            {
              [getTransientSuggestionKey()]: true,
              suggestion: true,
              suggestion_transient: {
                createdAt: 3,
                id: 'transient',
                type: 'insert' as const,
                userId: 'alice',
              },
              text: 'transient',
            },
          ],
          type: 'p',
        },
      ],
    } as any);

  it('finds inline and block suggestion nodes by id', () => {
    const editor = createEditor();
    const api = editor.getApi(BaseSuggestionPlugin).suggestion;

    expect(api.node({ at: [], id: 'inline', isText: true })?.[1]).toEqual([
      0, 0,
    ]);
    expect(api.node({ at: [], id: 'block' })?.[1]).toEqual([1]);
  });

  it('returns suggestion ids for inline and block nodes', () => {
    const editor = createEditor();
    const api = editor.getApi(BaseSuggestionPlugin).suggestion;

    expect(api.nodeId(editor.children[0].children[0] as any)).toBe('inline');
    expect(api.nodeId(editor.children[1] as any)).toBe('block');
  });

  it('filters transient suggestion nodes when requested', () => {
    const editor = createEditor();
    const api = editor.getApi(BaseSuggestionPlugin).suggestion;

    expect(api.nodes({ transient: true }).map(([, path]) => path)).toEqual([
      [2, 0],
    ]);
  });

  it('returns suggestion data and restores isSuggesting after withoutSuggestions', () => {
    const editor = createEditor();
    const api = editor.getApi(BaseSuggestionPlugin).suggestion;

    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);

    expect(api.suggestionData(editor.children[0].children[0] as any)).toEqual(
      inlineSuggestion
    );
    expect(api.suggestionData(editor.children[1] as any)).toEqual(
      blockSuggestion
    );

    api.withoutSuggestions(() => {
      expect(editor.getOptions(BaseSuggestionPlugin).isSuggesting).toBe(false);
    });

    expect(editor.getOptions(BaseSuggestionPlugin).isSuggesting).toBe(true);
  });
});
