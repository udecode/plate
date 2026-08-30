import {
  BaseParagraphPlugin,
  defineBasePlugin,
  schema,
  PLUGINS,
} from '../../core';
import { SUGGESTION_TRANSIENT_KEY } from '../../features/suggestion';
import { MarkdownPlugin } from '../../markdown';
import { createEditor } from '../../react/core';
import { SuggestionPlugin } from '../../react/features/suggestion';
import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { type AIChatDefinition, AIChatPlugin } from './AIChatPlugin';

const TableCellPlugin = defineBasePlugin(PLUGINS.tableCell, {
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: BaseParagraphPlugin,
        min: 1,
      }),
    },
  }),
});
const TableRowPlugin = defineBasePlugin(PLUGINS.tableRow, {
  schema: {
    element: {
      content: schema.content.element(TableCellPlugin, { min: 1 }),
    },
  },
});
const TablePlugin = defineBasePlugin(PLUGINS.table, {
  schema: {
    element: {
      content: schema.content.element(TableRowPlugin, { min: 1 }),
    },
  },
});

const createSuggestionEditor = (type: 'insert' | 'remove') => {
  const suggestionKey = 'suggestion_s1';

  return createEditor({
    plugins: [
      BaseParagraphPlugin,
      SuggestionPlugin.configure({ initialState: { currentUserId: 'u1' } }),
      AIChatPlugin,
    ],
    initialValue: [
      {
        children: [
          {
            [suggestionKey]: {
              createdAt: Date.parse('2024-01-01T00:00:00.000Z'),
              id: 's1',
              type,
              userId: 'u1',
            },
            suggestion: true,
            [SUGGESTION_TRANSIENT_KEY]: true,
            text: 'suggested',
          },
        ],
        type: 'paragraph',
      },
    ],
  });
};

describe('ai chat action utils', () => {
  it('diffs a table cell update and replaces only its children', () => {
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseAIPlugin,
        MarkdownPlugin,
        SuggestionPlugin.configure({ initialState: { currentUserId: 'u1' } }),
        AIChatPlugin,
        TablePlugin,
        TableRowPlugin,
        TableCellPlugin,
      ],
      initialValue: [
        {
          children: [
            {
              children: [
                {
                  children: [
                    { children: [{ text: 'old' }], type: 'paragraph' },
                  ],
                  type: 'tableCell',
                },
              ],
              type: 'tableRow',
            },
          ],
          type: 'table',
        },
      ],
    });
    const cellNodeKey = editor.key([0, 0, 0])!;
    editor.plugin(AIChatPlugin).store.set({
      _tableCellRefs: { c1: { key: cellNodeKey } },
    });

    editor
      .plugin(AIChatPlugin)
      .update.applyTableCellSuggestion({ content: 'ai', ref: 'c1' });

    expect(
      editor.read.nodes.some({
        at: [],
        match: (node) => Boolean(Reflect.get(node, SUGGESTION_TRANSIENT_KEY)),
      })
    ).toBe(true);
    expect(editor.read.text.string([])).toContain('ai');
    expect(editor.read.history.undos()).toHaveLength(1);
  });

  it('accepts transient insert suggestions and clears their metadata', () => {
    const editor = createSuggestionEditor('insert');

    editor.plugin(AIChatPlugin).update.acceptSuggestions();

    expect(editor.read.text.string([])).toBe('suggested');
    expect(
      editor.read.nodes.some({
        at: [],
        match: (node) => Boolean(Reflect.get(node, SUGGESTION_TRANSIENT_KEY)),
      })
    ).toBe(false);
  });

  it('rejects transient insert suggestions and clears their content', () => {
    const editor = createSuggestionEditor('insert');

    editor.plugin(AIChatPlugin).update.rejectSuggestions();

    expect(editor.read.text.string([])).toBe('');
  });

  it('stops chat, resets options, and undoes the active AI batch', () => {
    const stop = mock();
    const clear = mock();
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const chat = {
      messages: [
        {
          id: 'm1',
          parts: [{ text: 'answer', type: 'text' }],
          role: 'assistant',
        },
      ],
      clear,
      stop,
    } as unknown as NonNullable<AIChatDefinition['initialState']['chat']>;
    const nodeKey = editor.key([0])!;
    editor.plugin(AIChatPlugin).store.set({
      _replaceNodeKeys: [nodeKey],
      chat,
      chatNodes: [
        {
          node: editor.read.children()[0],
          nodeKey,
        },
      ],
      mode: 'chat',
      toolName: 'edit',
      open: true,
    });
    editor.update({ history: 'merge' }, (tx) => {
      tx.ai.markBatch();
      tx.ai.insertNodes([{ text: 'ai' }], { target: [0, 0] });
    });

    editor.plugin(AIChatPlugin).api.reset();

    expect(stop).toHaveBeenCalled();
    expect(clear).toHaveBeenCalled();
    expect(editor.read.text.string([])).toBe('');
    expect(editor.plugin(AIChatPlugin).store.get('_replaceNodeKeys')).toEqual(
      []
    );
    expect(editor.plugin(AIChatPlugin).store.get('chatNodes')).toEqual([]);
    expect(editor.plugin(AIChatPlugin).store.get('mode')).toBe('insert');
    expect(editor.plugin(AIChatPlugin).store.get('toolName')).toBeNull();
  });

  it('discards preview bookkeeping when reset skips undo', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
    });

    editor.plugin(BaseAIPlugin).update.beginPreview();
    editor.plugin(AIChatPlugin).api.reset({ undo: false });

    expect(editor.plugin(BaseAIPlugin).read.hasPreview()).toBe(false);
  });
});
