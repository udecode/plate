import { DefaultAuthoredPlugin } from '../../authored';
import { BaseParagraphPlugin, createEditorView } from '../../core';
import {
  BaseTablePlugin as TablePlugin,
  BaseTableRowPlugin as TableRowPlugin,
  BaseTableCellPlugin as TableCellPlugin,
} from '../../features/table';
import { MarkdownPlugin } from '../../markdown';
import { createEditor } from '../../react/core';
import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { AIChatPlugin } from './AIChatPlugin';

const createSuggestionEditor = () => {
  const editor = createEditor({
    plugins: [DefaultAuthoredPlugin, BaseParagraphPlugin, AIChatPlugin],
    userId: 'u1',
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
  });
  const node = editor.read.children()[0];

  editor.plugin(AIChatPlugin).store.set({
    chatNodes: [{ node, nodeKey: editor.key(node) }],
    mode: 'chat',
  });
  editor.plugin(AIChatPlugin).api.setPreview('suggested');

  return editor;
};

describe('ai chat action utils', () => {
  it('keeps streaming into an empty paragraph without changing editing mode', async () => {
    const editor = createEditor({
      plugins: [
        DefaultAuthoredPlugin,
        BaseParagraphPlugin,
        BaseAIPlugin,
        MarkdownPlugin,
        AIChatPlugin,
      ],
      userId: 'u1',
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 7 },
        focus: { path: [0, 0], offset: 7 },
      },
      initialValue: [{ type: 'paragraph', children: [{ text: 'AI Menu' }] }],
    });
    const view = createEditorView(editor);
    view.update.break.insert();
    const ai = view.plugin(AIChatPlugin);
    ai.api.show();

    ai.api.setPreview('AI can help ');
    await Promise.resolve();
    ai.api.setPreview(
      'AI can help turn an initial idea into a clear and useful first draft.'
    );

    expect(view.read.text.string([1])).toBe('');
    expect(view.read.authored.view()).toEqual({
      intent: 'edit',
      projection: 'accepted',
    });
    expect(ai.store.get('previewValue')[0].children).toEqual([
      {
        text: 'AI can help turn an initial idea into a clear and useful first draft.',
      },
    ]);
    ai.api.accept();
    view.update.text.insert('!');
    const typingUndo = await view.api.history.undo();
    expect(typingUndo.status).toBe('applied');
    const acceptanceUndo = await view.api.history.undo();
    expect(acceptanceUndo.status).toBe('applied');
    expect(view.read.text.string([1])).toBe('');
  });

  it('diffs a table cell update and replaces only its children', () => {
    const editor = createEditor({
      plugins: [
        DefaultAuthoredPlugin,
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

    editor
      .plugin(AIChatPlugin)
      .api.setTablePreview({ content: 'ai', ref: 'c1' });

    expect(
      editor.read.authored.changes({ status: 'pending' }).items
    ).toHaveLength(0);
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
    expect(editor.read.text.string([])).toBe('old');
    expect(editor.read.history().undos).toHaveLength(0);
    editor.plugin(AIChatPlugin).api.accept();
    expect(editor.read.text.string([])).toBe('ai');
    expect(editor.key([0, 0, 0])).toBe(cellNodeKey);
    expect(editor.read.history().undos).toHaveLength(1);
  });

  it('applies the draft as an ordinary edit', () => {
    const editor = createSuggestionEditor();

    editor.plugin(AIChatPlugin).api.accept();

    expect(editor.read.text.string([])).toBe('suggested');
    expect(editor.read.authored.changes({ status: 'pending' }).items).toEqual(
      []
    );
  });

  it('discards the draft without a document edit', () => {
    const editor = createSuggestionEditor();

    editor.plugin(AIChatPlugin).api.reset();

    expect(editor.read.text.string([])).toBe('');
  });
});
