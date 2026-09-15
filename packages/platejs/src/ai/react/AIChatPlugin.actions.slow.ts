import { BaseParagraphPlugin, definePlugin, PLUGINS, schema } from '../../core';
import { MarkdownPlugin } from '../../markdown';
import { createEditor } from '../../react/core';
import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { type AIChatDefinition, AIChatPlugin } from './AIChatPlugin';

const TableCellPlugin = definePlugin(PLUGINS.tableCell, {
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: BaseParagraphPlugin,
        min: 1,
      }),
    },
  }),
});
const TableRowPlugin = definePlugin(PLUGINS.tableRow, {
  schema: {
    element: {
      content: schema.content.element(TableCellPlugin, { min: 1 }),
    },
  },
});
const TablePlugin = definePlugin(PLUGINS.table, {
  schema: {
    element: {
      content: schema.content.element(TableRowPlugin, { min: 1 }),
    },
  },
});

const createSuggestionEditor = () => {
  const editor = createEditor({
    plugins: [BaseParagraphPlugin, AIChatPlugin],
    userId: 'u1',
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
  });
  const node = editor.read.children()[0];

  editor.api.authored.setView({
    intent: 'propose',
    projection: 'markup',
  });
  editor.plugin(AIChatPlugin).store.set({
    chatNodes: [{ node, nodeKey: editor.key(node) }],
    mode: 'chat',
  });
  editor.plugin(AIChatPlugin).update.applySuggestions('suggested');

  return editor;
};

describe('ai chat action utils', () => {
  it('diffs a table cell update and replaces only its children', () => {
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseAIPlugin,
        MarkdownPlugin,
        AIChatPlugin,
        TablePlugin,
        TableRowPlugin,
        TableCellPlugin,
      ],
      userId: 'u1',
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
    editor.api.authored.setView({
      intent: 'propose',
      projection: 'markup',
    });

    editor
      .plugin(AIChatPlugin)
      .update.applyTableCellSuggestion({ content: 'ai', ref: 'c1' });

    expect(
      editor.read.authored.changes({ status: 'pending' }).items
    ).toHaveLength(1);
    expect(editor.read.value().children).toEqual([
      {
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: 'old' }], type: 'paragraph' }],
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
        ],
        type: 'table',
      },
    ]);
    expect(editor.read.text.string([])).toContain('ai');
    expect(editor.read.history.undos()).toHaveLength(1);
  });

  it('accepts the tracked AI proposal through native authored decisions', () => {
    const editor = createSuggestionEditor();

    const result = editor.plugin(AIChatPlugin).update.acceptSuggestions();

    expect(result?.status).toBe('applied');
    expect(editor.read.text.string([])).toBe('suggested');
    expect(editor.read.authored.changes({ status: 'pending' }).items).toEqual(
      []
    );
  });

  it('rejects the tracked AI proposal through native authored decisions', () => {
    const editor = createSuggestionEditor();

    const result = editor.plugin(AIChatPlugin).update.rejectSuggestions();

    expect(result?.status).toBe('applied');
    expect(editor.read.text.string([])).toBe('');
  });

  it('stops chat, resets options, and undoes the active AI batch', () => {
    const stop = mock();
    const clear = mock();
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      userId: 'u1',
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
      userId: 'u1',
    });

    editor.plugin(BaseAIPlugin).update.beginPreview();
    editor.plugin(AIChatPlugin).api.reset({ undo: false });

    expect(editor.plugin(BaseAIPlugin).read.hasPreview()).toBe(false);
  });
});
