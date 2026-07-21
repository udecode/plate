import { BaseParagraphPlugin, createBaseEditor } from '@platejs/core';

import { BaseAIPlugin } from '../BaseAIPlugin';
import { aiBatchEffect, withAIBatch } from './withAIBatch';

const createEditor = () =>
  createBaseEditor({
    plugins: [BaseParagraphPlugin, BaseAIPlugin],
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    value: [{ children: [{ text: '' }], type: 'p' }],
  });

describe('withAIBatch', () => {
  it('tags a merged AI write with state tracked by history', () => {
    const editor = createEditor();

    withAIBatch(editor, (tx) => {
      tx.text.insert('ai');
    });

    const [batch] = editor.read.history.undos();

    expect(editor.read.text.string([])).toBe('ai');
    expect(batch?.effects).toContainEqual(
      expect.objectContaining({ type: aiBatchEffect, value: -1 })
    );
  });

  it('starts a fresh batch when split is true', () => {
    const editor = createEditor();

    editor.update.text.insert('before');
    withAIBatch(
      editor,
      (tx) => {
        tx.text.insert(' ai');
      },
      { split: true }
    );

    expect(editor.read.history.undos()).toHaveLength(2);

    editor.update.history.undo();

    expect(editor.read.text.string([])).toBe('before');
  });

  it('records an AI batch even when the callback has no document writes', () => {
    const editor = createEditor();

    withAIBatch(editor, () => {});

    expect(editor.read.history.undos()).toHaveLength(1);
    expect(editor.read.history.undos()[0]?.effects).toContainEqual(
      expect.objectContaining({ type: aiBatchEffect, value: -1 })
    );
  });

  it('merges consecutive AI chunks into one undo batch', () => {
    const editor = createEditor();

    withAIBatch(
      editor,
      (tx) => {
        tx.nodes.insert({ ai: true, text: 'first' }, { at: [0, 1] });
      },
      { split: true }
    );
    withAIBatch(editor, (tx) => {
      tx.nodes.insert({ ai: true, text: ' second' }, { at: [0, 1] });
    });

    expect(editor.read.text.string([])).toBe('first second');
    expect(editor.read.history.undos()).toHaveLength(1);

    editor.update.history.undo();

    expect(editor.read.text.string([])).toBe('');
  });
});
