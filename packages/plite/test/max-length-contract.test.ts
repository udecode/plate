import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, DocumentChange, type Element } from '@platejs/plite';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const createLimitedEditor = (maxLength?: number) =>
  createEditor({
    initialSelection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    initialValue: [paragraph('')],
    maxLength,
  });

describe('maxLength editor option', () => {
  it('does not limit text when maxLength is absent', () => {
    const editor = createLimitedEditor();

    editor.update.text.insert('Hello world');

    assert.equal(editor.read.text.string([]), 'Hello world');
  });

  it('truncates inserted text at the configured limit', () => {
    const editor = createLimitedEditor(5);

    editor.update.text.insert('Hello world');

    assert.equal(editor.read.text.string([]), 'Hello');
  });

  it('keeps later insertions inside the configured limit', () => {
    const editor = createLimitedEditor(5);

    editor.update.text.insert('Hel');
    editor.update.text.insert('lo world');

    assert.equal(editor.read.text.string([]), 'Hello');
  });

  it('counts selected replacement text before truncating', () => {
    const editor = createEditor({
      initialSelection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 5 },
      },
      initialValue: [paragraph('Hello')],
      maxLength: 5,
    });

    editor.update.text.insert('y there');

    assert.equal(editor.read.text.string([]), 'Hey t');
  });

  it('truncates inserted fragments', () => {
    const editor = createLimitedEditor(5);

    editor.update((tx) => {
      tx.fragment.replace([paragraph('Hel'), paragraph('lo world')]);
    });

    assert.equal(editor.read.text.string([]), 'Hello');
  });

  it('truncates inserted nodes', () => {
    const editor = createLimitedEditor(5);

    editor.update.nodes.insert(paragraph('Hello world'), { at: [1] });

    assert.equal(editor.read.text.string([]), 'Hello');
  });

  it('does not limit imported canonical changes', () => {
    const editor = createLimitedEditor(5);
    const before = editor.read.value();
    const change = DocumentChange.between(before, {
      ...before,
      children: [paragraph('Hello world')],
    });

    editor.update((tx) => tx.changes.apply(change));

    assert.equal(editor.read.text.string([]), 'Hello world');
  });

  it('rejects invalid maxLength values', () => {
    assert.throws(
      () => createEditor({ maxLength: -1 }),
      /maxLength must be a non-negative safe integer/
    );
  });
});
