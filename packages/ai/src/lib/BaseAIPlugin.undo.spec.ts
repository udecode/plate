import { BaseParagraphPlugin, createBaseEditor } from '@platejs/core';
import {
  BaseSuggestionPlugin,
  SUGGESTION_TRANSIENT_KEY,
} from '@platejs/suggestion';

import { AI_PREVIEW_KEY, BaseAIPlugin } from './BaseAIPlugin';
import { AIChatPlugin } from '../react/ai-chat/AIChatPlugin';

const createEditor = () =>
  createBaseEditor({
    plugins: [
      BaseParagraphPlugin,
      BaseSuggestionPlugin,
      BaseAIPlugin,
      AIChatPlugin.configure({ options: { open: true } }),
    ],
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    initialValue: [{ children: [{ text: '' }], type: 'p' }],
  });

describe('undoAI', () => {
  it('does not undo untagged AI content', () => {
    const editor = createEditor();

    editor.update((tx) => {
      tx.nodes.insert({ ai: true, text: 'plain batch' }, { at: [0, 1] });
    });
    editor.plugin(BaseAIPlugin).api.undo();

    expect(editor.read.text.string([])).toBe('plain batch');
  });

  it('does not undo an AI batch after its AI content is gone', () => {
    const editor = createEditor();

    editor.update({ history: 'merge' }, (tx) => {
      tx.ai.markBatch();
      tx.text.insert('plain');
    });
    editor.plugin(BaseAIPlugin).api.undo();

    expect(editor.read.text.string([])).toBe('plain');
  });

  it('undoes the latest AI batch and permanently discards its redo', () => {
    const editor = createEditor();

    editor.update({ history: 'merge' }, (tx) => {
      tx.ai.markBatch();
      tx.nodes.insert(
        { [SUGGESTION_TRANSIENT_KEY]: true, text: 'suggestion' },
        { at: [0, 1] }
      );
    });
    editor.plugin(BaseAIPlugin).api.undo();

    expect(editor.read.text.string([])).toBe('');

    editor.update.history.redo();

    expect(editor.read.text.string([])).toBe('');
  });

  it('undoes every merged chunk in the latest AI response', () => {
    const editor = createEditor();

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.ai.markBatch();
      tx.nodes.insert(
        { [SUGGESTION_TRANSIENT_KEY]: true, text: 'first' },
        { at: [0, 1] }
      );
    });
    editor.update({ history: 'merge' }, (tx) => {
      tx.ai.markBatch();
      tx.nodes.insert(
        { [SUGGESTION_TRANSIENT_KEY]: true, text: ' second' },
        { at: [0, 1] }
      );
    });

    editor.plugin(BaseAIPlugin).api.undo();

    expect(editor.read.text.string([])).toBe('');
    expect(editor.read.history.redos()).toHaveLength(0);
  });

  it('cancels an active preview before touching AI history', () => {
    const editor = createEditor();
    const original = structuredClone(editor.read.children()[0]!);

    editor
      .plugin(BaseAIPlugin)
      .api.beginPreview({ originalBlocks: [original] });
    editor.update({ history: 'skip' }).value.replace({
      children: [
        {
          [AI_PREVIEW_KEY]: true,
          children: [{ ai: true, text: 'preview' }],
          type: 'p',
        },
        { children: [{ text: '' }], type: 'aiChat' },
      ],
      selection: null,
    });

    editor.plugin(BaseAIPlugin).api.undo();

    expect(editor.read.children()).toEqual([original]);
    expect(editor.plugin(BaseAIPlugin).api.hasPreview()).toBe(false);
  });
});
