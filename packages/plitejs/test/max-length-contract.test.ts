import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  DocumentChange,
  type Element,
  SelectionApi,
} from 'plitejs';
import { history } from 'plitejs/history';

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

  it('limits command-owned replacement of fully selected sibling blocks', () => {
    const initialValue = [paragraph('abc'), paragraph('def')];
    const editor = createEditor({
      initialSelection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 3 },
      },
      initialValue,
      maxLength: 5,
      plugins: [history()],
    });

    editor.update.text.insert('123456789');

    assert.deepEqual(editor.read.children(), [paragraph('12345')]);

    editor.api.history.undo();

    assert.deepEqual(editor.read.children(), initialValue);
  });

  it('limits full-block replacement in the active named root', () => {
    const initialHeader = [paragraph('abc'), paragraph('def')];
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: initialHeader },
      },
      maxLength: 5,
      plugins: [history()],
    });
    const header = createEditorView(editor, { root: 'header' });

    header.update.selection.set({
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 3 },
    });
    header.update.text.insert('123456789');

    assert.deepEqual(editor.read.children(), [paragraph('body')]);
    assert.deepEqual(header.read.children(), [paragraph('12345')]);

    editor.api.history.undo();

    assert.deepEqual(header.read.children(), initialHeader);
  });

  it('counts exact node-selection replacement before constructing its block', () => {
    const editor = createEditor({
      initialSelection: null,
      initialValue: [paragraph('aa'), paragraph('b'), paragraph('cc')],
      maxLength: 5,
    });

    editor.update.selection.set(SelectionApi.nodes([[0], [2]]));
    editor.update.text.insert('123456');

    assert.deepEqual(editor.read.children(), [
      paragraph('1234'),
      paragraph('b'),
    ]);
  });

  it('permits an empty replacement when maxLength is zero', () => {
    const editor = createEditor({
      initialSelection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      },
      initialValue: [paragraph('abc')],
      maxLength: 0,
    });

    editor.update.text.insert('replacement');

    assert.deepEqual(editor.read.children(), [paragraph('')]);
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
