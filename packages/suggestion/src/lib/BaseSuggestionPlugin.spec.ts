import {
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import { schema } from '@platejs/plite';

import {
  BaseSuggestionPlugin,
  SUGGESTION_TRANSIENT_KEY,
  SuggestionUpdatePolicy,
} from './BaseSuggestionPlugin';

const SuggestionTargetPlugin = createBasePlugin({
  key: 'suggestionTarget',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
});

const InlineSuggestionTargetPlugin = createBasePlugin({
  key: 'inlineSuggestionTarget',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
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
        InlineSuggestionTargetPlugin,
        BaseSuggestionPlugin,
      ],
      initialValue: [
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
              [SUGGESTION_TRANSIENT_KEY]: true,
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

  it('canonicalizes false base suggestion marks to the absent default', () => {
    const editor = createEditor();

    expect(
      editor.read.schema.fitDocument({
        children: [
          { children: [{ suggestion: false, text: 'plain' }], type: 'p' },
        ],
      })
    ).toEqual({
      children: [{ children: [{ text: 'plain' }], type: 'p' }],
    });
  });

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
    ).toBeNull();
    expect(
      editor.read.schema.property({
        key: 'suggestion',
        placement: 'element',
        type: InlineSuggestionTargetPlugin.key,
      })
    ).toMatchObject({ value: { kind: 'boolean' } });
    expect(
      editor.read.schema.property({
        key: 'suggestion_any',
        placement: 'element',
        type: InlineSuggestionTargetPlugin.key,
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
        key: SUGGESTION_TRANSIENT_KEY,
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
        type: InlineSuggestionTargetPlugin.key,
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

  it('validates block and inline suggestion payloads', () => {
    const editor = createEditor();
    const block = editor.read.schema.property({
      key: 'suggestion',
      placement: 'element',
      type: 'p',
    })?.value.validate;
    const inline = editor.read.schema.property({
      key: 'suggestion_any',
      placement: 'text',
      type: 'p',
    })?.value.validate;

    expect(block?.(blockSuggestion)).toBe(true);
    expect(block?.({ ...blockSuggestion, createdAt: 'invalid' })).toBe(false);
    expect(inline?.(inlineSuggestion)).toBe(true);
    expect(inline?.({ ...inlineSuggestion, userId: null })).toBe(false);
  });

  it('finds inline and block suggestion nodes by id', () => {
    const editor = createEditor();
    const { read } = editor.plugin(BaseSuggestionPlugin);

    expect(read.node({ at: [], id: 'inline', isText: true })?.[1]).toEqual([
      0, 0,
    ]);
    expect(read.node({ at: [], id: 'block' })?.[1]).toEqual([1]);
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
    const { read } = editor.plugin(BaseSuggestionPlugin);

    expect(read.nodes({ transient: true }).map(([, path]) => path)).toEqual([
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
      initialValue: [{ children: [{ text: 'plain' }], type: 'p' }],
    } as any);

    editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });
    editor.update.selection.set({ offset: 5, path: [0, 0] });
    editor.update(SuggestionUpdatePolicy.skip).text.insert('!');

    expect(editor.read.children()[0].children).toEqual([{ text: 'plain!' }]);
    expect(Object.isFrozen(SuggestionUpdatePolicy)).toBe(true);
    expect(Object.isFrozen(SuggestionUpdatePolicy.skip)).toBe(true);
    expect(Object.isFrozen(SuggestionUpdatePolicy.skip.tags)).toBe(true);
  });
});
