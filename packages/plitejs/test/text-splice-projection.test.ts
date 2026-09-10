import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, createEditorView } from 'plitejs';
import { history } from 'plitejs/history';

import {
  projectEditorTextSplices,
  type TextSplice,
} from '../src/core/change/text-splices';
import { getEditorCommitSnapshot } from '../src/core/commit';
import { getLastCommit, getNodeKey } from '../src/internal';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const apply = (text: string, changes: readonly TextSplice[]) => {
  let result = text;

  for (let index = changes.length - 1; index >= 0; index--) {
    const change = changes[index];
    result =
      result.slice(0, change.from) + change.insert + result.slice(change.to);
  }
  return result;
};

describe('canonical text splice projection', () => {
  it('projects disjoint replacement, insertion, and deletion in before UTF-16 coordinates', () => {
    const text = 'A😀B\nC🌍D';
    const editor = createEditor({ initialValue: [paragraph(text)] });
    const key = getNodeKey(editor, [0, 0]);
    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { path: [0, 0], offset: 8 },
          focus: { path: [0, 0], offset: 9 },
        },
      });
      tx.text.insert('paste\n', { at: { path: [0, 0], offset: 5 } });
      tx.text.delete({
        at: {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 3 },
        },
      });
      tx.text.insert('🚀', { at: { path: [0, 0], offset: 1 } });
    });
    const commit = getLastCommit(editor)!;
    const projection = projectEditorTextSplices(commit);
    const changes = projection.changes.get(key)!;
    assert.ok(changes);
    assert.deepEqual(changes, [
      { from: 1, to: 3, insert: '🚀' },
      { from: 5, to: 5, insert: 'paste\n' },
      { from: 8, to: 9, insert: '' },
    ]);
    assert.equal(
      apply(text, changes),
      editor.read.children()[0].children[0].text
    );
    assert.equal(projectEditorTextSplices(commit), projection);
    assert.equal(projection.insertedCodeUnits, 8);
  });

  it('handles empty text and both end boundaries without a reset', () => {
    const editor = createEditor({ initialValue: [paragraph('')] });
    const key = getNodeKey(editor, [0, 0]);
    editor.update.text.insert('😀\n', { at: { path: [0, 0], offset: 0 } });
    assert.deepEqual(
      projectEditorTextSplices(getLastCommit(editor)!).changes.get(key),
      [{ from: 0, to: 0, insert: '😀\n' }]
    );
    editor.update.text.delete({
      at: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      },
    });
    assert.deepEqual(
      projectEditorTextSplices(getLastCommit(editor)!).changes.get(key),
      [{ from: 0, to: 3, insert: '' }]
    );
  });

  it('projects undo and redo incrementally through the one history owner', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: [paragraph('abcd')],
    });
    const key = getNodeKey(editor, [0, 0]);
    editor.update.text.insert('X', { at: { path: [0, 0], offset: 2 } });
    editor.update.history.undo();
    assert.deepEqual(
      projectEditorTextSplices(getLastCommit(editor)!).changes.get(key),
      [{ from: 2, to: 3, insert: '' }]
    );
    editor.update.history.redo();
    assert.deepEqual(
      projectEditorTextSplices(getLastCommit(editor)!).changes.get(key),
      [{ from: 2, to: 2, insert: 'X' }]
    );
  });

  it('uses the correct before and after named-root snapshots', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { notes: [paragraph('note')] },
      },
    });
    const notes = createEditorView(editor, { root: 'notes' });
    const key = getNodeKey(notes, [0, 0]);
    notes.update.text.insert('!', { at: { path: [0, 0], offset: 2 } });
    const commit = getLastCommit(editor)!;
    assert.equal(projectEditorTextSplices(commit).changes.size, 0);
    assert.deepEqual(
      projectEditorTextSplices(commit, 'notes').changes.get(key),
      [{ from: 2, to: 2, insert: '!' }]
    );
    assert.equal(
      getEditorCommitSnapshot(commit, 'notes', 'before').children[0].children[0]
        .text,
      'note'
    );
    assert.equal(
      getEditorCommitSnapshot(commit, 'notes').children[0].children[0].text,
      'no!te'
    );
  });

  it('does not reset unchanged text when its owner moves', () => {
    const editor = createEditor({
      initialValue: [paragraph('first'), paragraph('second')],
    });
    const key = getNodeKey(editor, [1, 0]);
    editor.update.nodes.move({ at: [1], to: [0] });
    const projection = projectEditorTextSplices(getLastCommit(editor)!);
    assert.equal(getNodeKey(editor, [0, 0]), key);
    assert.equal(projection.changes.has(key), false);
  });

  it('projects remote canonical changes without using the sender node identities', () => {
    const source = createEditor({ initialValue: [paragraph('remote')] });
    const target = createEditor({ initialValue: [paragraph('remote')] });
    const key = getNodeKey(target, [0, 0]);
    source.update.text.insert('🌍', { at: { path: [0, 0], offset: 3 } });
    target.update((tx) => tx.changes.apply(getLastCommit(source)!.changes));
    assert.deepEqual(
      projectEditorTextSplices(getLastCommit(target)!).changes.get(key),
      [{ from: 3, to: 3, insert: '🌍' }]
    );
  });

  it('marks structural text replacement as a reset rather than guessing a diff', () => {
    const editor = createEditor({ initialValue: [paragraph('old')] });
    editor.update((tx) => {
      tx.nodes.remove({ at: [0] });
      tx.nodes.insert(paragraph('replacement'), { at: [0] });
    });
    const key = getNodeKey(editor, [0, 0]);
    assert.equal(
      projectEditorTextSplices(getLastCommit(editor)!).changes.get(key),
      null
    );
  });

  for (const count of [1, 10, 100, 1000]) {
    it(`visits changed ranges, not the 4.9M-byte text, for ${count} splices`, () => {
      const text = 'a'.repeat(4_900_000);
      const editor = createEditor({
        initialValue: [paragraph(text), paragraph('untouched')],
      });
      const key = getNodeKey(editor, [0, 0]);
      editor.update((tx) => {
        for (let index = count; index > 0; index--) {
          tx.text.insert('X', { at: { path: [0, 0], offset: index * 4096 } });
        }
      });
      const projection = projectEditorTextSplices(getLastCommit(editor)!);
      const changes = projection.changes.get(key)!;
      assert.ok(changes);
      assert.equal(changes.length, count);
      assert.equal(projection.changes.size, 1);
      assert.equal(projection.insertedCodeUnits, count);
      assert.ok(projection.visitedSections <= count * 2 + 1);
      assert.equal(
        apply(text, changes),
        editor.read.children()[0].children[0].text
      );
    });
  }
});
