import {
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import { schema } from '@platejs/plite';

import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';
import { SuggestionUpdatePolicy } from './update-policy';
import { getTransientSuggestionKey } from './utils/getTransientSuggestionKey';

const SuggestionTargetPlugin = createBasePlugin({
  key: 'suggestionTarget',
  node: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      groups: ['block'],
    },
  },
});

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
    createBaseEditor({
      plugins: [
        BaseParagraphPlugin,
        SuggestionTargetPlugin,
        BaseSuggestionPlugin,
      ],
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

  it('compiles suggestion placement, namespace, lifecycle, and merge laws', () => {
    const editor = createEditor();
    const paragraph = { children: [{ text: '' }], type: 'p' };
    const replacement = {
      createdAt: 4,
      id: 'replacement',
      type: 'remove' as const,
      userId: 'alice',
    };

    expect(
      editor.read.schema.property({
        key: 'suggestion',
        placement: 'element',
        type: 'p',
      })
    ).toMatchObject({ value: { kind: 'json' } });
    expect(
      editor.read.schema.property({
        key: 'suggestion_any',
        placement: 'element',
        type: 'p',
      })
    ).toMatchObject({ value: { kind: 'json' } });
    expect(
      editor.read.schema.property({
        key: 'suggestion',
        placement: 'text',
        type: 'p',
      })
    ).toMatchObject({
      lifecycle: {
        split: 'preserve',
        typeChange: 'preserve-if-allowed',
      },
      merge: 'replace',
      value: { kind: 'boolean' },
    });
    expect(
      editor.read.schema.property({
        key: 'suggestion_any',
        placement: 'text',
        type: 'p',
      })
    ).toMatchObject({
      lifecycle: {
        split: 'preserve',
        typeChange: 'preserve-if-allowed',
      },
      merge: 'replace',
      value: { kind: 'json' },
    });
    expect(
      editor.read.schema.property({
        key: getTransientSuggestionKey(),
        placement: 'text',
        type: 'p',
      })
    ).toMatchObject({ value: { kind: 'boolean' } });
    expect(
      editor.read.schema.property({
        key: 'suggestion_any',
        placement: 'text',
        type: paragraph.type,
      })
    ).not.toBeNull();
    expect(
      editor.read.schema.property({
        key: 'suggestion_any',
        placement: 'text',
        type: 'missing',
      })
    ).toBeNull();
    expect(
      editor.read.schema.property({
        key: 'suggestion_any',
        placement: 'element',
        type: 'p',
      })?.value.significant
    ).toBe(true);

    editor.update.nodes.set({ type: 'suggestionTarget' }, { at: [0] });

    expect(editor.read.nodes.get([0, 0])?.[0]).toMatchObject({
      suggestion: true,
      suggestion_inline: inlineSuggestion,
      text: 'inline',
    });

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 6, path: [0, 0] },
    });
    editor.update.marks.add('suggestion_inline', replacement);

    expect(editor.read.nodes.get([0, 0])?.[0]).toMatchObject({
      suggestion_inline: replacement,
    });
  });

  it('finds inline and block suggestion nodes by id', () => {
    const editor = createEditor();
    const api = editor.plugin(BaseSuggestionPlugin).api;

    expect(api.node({ at: [], id: 'inline', isText: true })?.[1]).toEqual([
      0, 0,
    ]);
    expect(api.node({ at: [], id: 'block' })?.[1]).toEqual([1]);
  });

  it('returns suggestion ids for inline and block nodes', () => {
    const editor = createEditor();
    const api = editor.plugin(BaseSuggestionPlugin).api;

    expect(api.nodeId(editor.read.children()[0].children[0] as any)).toBe(
      'inline'
    );
    expect(api.nodeId(editor.read.children()[1] as any)).toBe('block');
  });

  it('filters transient suggestion nodes when requested', () => {
    const editor = createEditor();
    const api = editor.plugin(BaseSuggestionPlugin).api;

    expect(api.nodes({ transient: true }).map(([, path]) => path)).toEqual([
      [2, 0],
    ]);
  });

  it('returns suggestion data', () => {
    const editor = createEditor();
    const api = editor.plugin(BaseSuggestionPlugin).api;

    expect(
      api.suggestionData(editor.read.children()[0].children[0] as any)
    ).toEqual(inlineSuggestion);
    expect(api.suggestionData(editor.read.children()[1] as any)).toEqual(
      blockSuggestion
    );
  });

  it('bypasses suggestion tracking with the skip policy', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseSuggestionPlugin],
      value: [{ children: [{ text: 'plain' }], type: 'p' }],
    } as any);

    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);
    editor.update.selection.set({ offset: 5, path: [0, 0] });
    editor.update(SuggestionUpdatePolicy.skip).text.insert('!');

    expect(editor.read.children()[0].children).toEqual([{ text: 'plain!' }]);
    expect(Object.isFrozen(SuggestionUpdatePolicy)).toBe(true);
    expect(Object.isFrozen(SuggestionUpdatePolicy.skip)).toBe(true);
    expect(Object.isFrozen(SuggestionUpdatePolicy.skip.tags)).toBe(true);
  });
});
