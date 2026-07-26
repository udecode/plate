import { BaseParagraphPlugin, createBaseEditor } from '@platejs/core';

import { BaseAIPlugin } from './BaseAIPlugin';

const createEditor = () =>
  createBaseEditor({
    plugins: [BaseParagraphPlugin, BaseAIPlugin],
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    initialValue: [{ children: [{ text: '' }], type: 'p' }],
  });

describe('BaseAIPlugin AI batches', () => {
  it('tags a merged AI write with state tracked by history', () => {
    const editor = createEditor();

    editor.update({ history: 'merge' }, (tx) => {
      tx.ai.markBatch();
      tx.text.insert('ai');
    });

    expect(editor.read.text.string([])).toBe('ai');
    expect(editor.read.history.undos()).toHaveLength(1);
  });

  it('starts a fresh batch when split is true', () => {
    const editor = createEditor();

    editor.update.text.insert('before');
    editor.update({ history: 'new-batch' }, (tx) => {
      tx.ai.markBatch();
      tx.text.insert(' ai');
    });

    expect(editor.read.history.undos()).toHaveLength(2);

    editor.update.history.undo();

    expect(editor.read.text.string([])).toBe('before');
  });

  it('records an AI batch even when the callback has no document writes', () => {
    const editor = createEditor();

    editor.update({ history: 'merge' }, (tx) => {
      tx.ai.markBatch();
    });

    expect(editor.read.history.undos()).toHaveLength(1);
  });

  it('merges consecutive AI chunks into one undo batch', () => {
    const editor = createEditor();

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.ai.markBatch();
      tx.nodes.insert({ ai: true, text: 'first' }, { at: [0, 1] });
    });
    editor.update({ history: 'merge' }, (tx) => {
      tx.ai.markBatch();
      tx.nodes.insert({ ai: true, text: ' second' }, { at: [0, 1] });
    });

    expect(editor.read.text.string([])).toBe('first second');
    expect(editor.read.history.undos()).toHaveLength(1);

    editor.update.history.undo();

    expect(editor.read.text.string([])).toBe('');
  });
});
