import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fc from 'fast-check';
import {
  type Anchor,
  createEditor,
  createEditorView,
  type Descendant,
  type Editor,
  type Range,
  TextApi,
} from 'plitejs';

import { history } from '../../src/history';
import { observeAnchorStateWork } from '../../src/internal';

const paragraph = (text: string) =>
  ({
    type: 'paragraph',
    children: [{ text }],
  }) satisfies Descendant;

const undo = (editor: Editor) => {
  editor.update((tx) => {
    tx.history.undo();
  });
};

const redo = (editor: Editor) => {
  editor.update((tx) => {
    tx.history.redo();
  });
};

describe('persistent anchor history contract', () => {
  it('restores a fully deleted inward range exactly through undo and redo', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: { children: [paragraph('This')] },
    });
    const before = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    } as const;
    const after = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    } as const;
    const anchor = editor.anchor(before, {
      association: 'inward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({ at: { ...before, kind: 'text' } });
    });

    assert.deepEqual(anchor.resolve(), after);

    for (let cycle = 0; cycle < 10; cycle++) {
      undo(editor);
      assert.deepEqual(anchor.resolve(), before, `undo cycle ${cycle}`);

      redo(editor);
      assert.deepEqual(anchor.resolve(), after, `redo cycle ${cycle}`);
    }
  });

  it('keeps the earliest and latest range across an explicitly merged batch', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: { children: [paragraph('abcd')] },
    });
    const anchor = editor.anchor(
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      },
      { association: 'inward', deletion: 'nearest' }
    );

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({
        at: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 2 },
        },
      });
    });
    editor.update((tx) => {
      tx.history.merge();
      tx.text.delete({
        at: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 2 },
        },
      });
    });

    assert.equal(
      editor.read((state) => state.history.undos().length),
      1
    );
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    });

    undo(editor);
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    });

    redo(editor);
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    });
  });

  it('preserves backward range direction after full deletion', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: { children: [paragraph('This')] },
    });
    const before = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 0 },
    } as const;
    const anchor = editor.anchor(before, {
      association: 'inward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({ at: { ...before, kind: 'text' } });
    });
    undo(editor);

    assert.deepEqual(anchor.resolve(), before);

    redo(editor);
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('restores a path that shifts across a structural history batch', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: {
        children: [paragraph('alpha'), paragraph('beta')],
      },
    });
    const anchor = editor.anchor([1], {
      association: 'forward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.nodes.remove({ at: [0] });
    });

    assert.deepEqual(anchor.resolve(), [0]);
    undo(editor);
    assert.deepEqual(anchor.resolve(), [1]);
    redo(editor);
    assert.deepEqual(anchor.resolve(), [0]);
  });

  it('restores the exact side of a point at a text-node boundary', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: {
        children: [
          {
            type: 'paragraph',
            children: [{ bold: true, text: 'a' }, { text: 'b' }],
          },
        ],
      },
    });
    const before = { path: [0, 0], offset: 1 } as const;
    const anchor = editor.anchor(before, {
      association: 'backward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({
        at: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: before,
        },
      });
    });
    undo(editor);

    assert.deepEqual(anchor.resolve(), before);
    redo(editor);
    assert.deepEqual(anchor.resolve(), { path: [0, 0], offset: 0 });
  });

  it('round-trips an expanded range in a named root', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('Title')] },
      },
    });
    const header = createEditorView(editor, { root: 'header' });
    const before = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    } as const;
    const anchor = header.anchor(before, {
      association: 'inward',
      deletion: 'nearest',
    });

    header.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({ at: { ...before, kind: 'text' } });
    });
    undo(header);
    assert.deepEqual(anchor.resolve(), before);
    redo(header);
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('never resurrects dropped or released anchors from private recovery', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: { children: [paragraph('This')] },
    });
    const range = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    } as const;
    const nearest = editor.anchor(range, {
      association: 'inward',
      deletion: 'nearest',
    });
    const dropped = editor.anchor(range, {
      association: 'inward',
      deletion: 'drop',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({ at: { ...range, kind: 'text' } });
    });

    nearest.release();
    assert.deepEqual(dropped.resolve(), {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    undo(editor);
    assert.equal(nearest.resolve(), null);
    assert.deepEqual(dropped.resolve(), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });

    redo(editor);
    assert.equal(nearest.resolve(), null);
    assert.deepEqual(dropped.resolve(), {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('maps an anchor created after an edit without applying older recovery', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: { children: [paragraph('This')] },
    });
    const deleted = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    } as const;

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({ at: { ...deleted, kind: 'text' } });
    });
    const anchor = editor.anchor(deleted, {
      association: 'inward',
      deletion: 'nearest',
    });

    undo(editor);
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 2 },
    });

    redo(editor);
    assert.deepEqual(anchor.resolve(), deleted);
  });

  it('publishes exact historic geometry atomically with a compact record', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: { children: [paragraph('This')] },
    });
    const before = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    } as const;
    const anchor = editor.anchor(before, {
      association: 'inward',
      deletion: 'nearest',
    });
    let historicCommit = false;
    let observed: ReturnType<typeof anchor.resolve> | undefined;
    let captureEntries = 0;
    let captureBytes = 0;
    const stop = observeAnchorStateWork(editor, (work) => {
      if (work.phase !== 'commit') return;
      if (historicCommit) observed = anchor.resolve();
      else {
        captureEntries = work.recoveryEntries ?? 0;
        captureBytes = work.recoveryBytes ?? 0;
      }
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({ at: { ...before, kind: 'text' } });
    });
    assert.equal(captureEntries, 1);
    assert.equal(captureBytes, 28);

    historicCommit = true;
    undo(editor);
    historicCommit = false;

    assert.deepEqual(observed, before);
    stop();
  });

  it('does not serialize runtime anchor recovery through history restore', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: { children: [paragraph('This')] },
    });
    const before = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    } as const;
    const anchor = editor.anchor(before, {
      association: 'inward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({ at: { ...before, kind: 'text' } });
    });
    const snapshot = editor.read((state) => state.history());

    editor.update((tx) => {
      tx.history.restore(snapshot);
    });
    undo(editor);

    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
  });

  it('maps both recovery sides through a skipped edit before undo and redo', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: { children: [paragraph('This')] },
    });
    const deleted = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    } as const;
    const anchor = editor.anchor(deleted, {
      association: 'inward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({ at: { ...deleted, kind: 'text' } });
    });
    editor.update({ history: 'skip' }, (tx) => {
      tx.text.insert('>', { at: { path: [0, 0], offset: 0 } });
    });

    undo(editor);
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 2 },
    });

    editor.update({ history: 'skip', tags: 'remote-change' }, (tx) => {
      tx.text.insert('#', { at: { path: [0, 0], offset: 0 } });
    });

    redo(editor);
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    });
  });

  it('maps both recovery sides with a block moved before undo and redo', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: {
        children: [paragraph('alpha'), paragraph('beta')],
      },
    });
    const before = {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 3 },
    } as const;
    const anchor = editor.anchor(before, {
      association: 'inward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({ at: { ...before, kind: 'text' } });
    });
    editor.update({ history: 'skip', tags: 'remote-change' }, (tx) => {
      tx.nodes.move({ at: [1], to: [0] });
    });

    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });

    undo(editor);
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    });

    redo(editor);
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
  });

  it('maps path recovery with its block moved before undo and redo', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: {
        children: [paragraph('alpha'), paragraph('beta')],
      },
    });
    const anchor = editor.anchor([1], {
      association: 'forward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({
        at: {
          kind: 'text',
          anchor: { path: [1, 0], offset: 1 },
          focus: { path: [1, 0], offset: 2 },
        },
      });
    });
    editor.update({ history: 'skip', tags: 'remote-change' }, (tx) => {
      tx.nodes.move({ at: [1], to: [0] });
    });

    assert.deepEqual(anchor.resolve(), [0]);
    undo(editor);
    assert.deepEqual(anchor.resolve(), [0]);
    redo(editor);
    assert.deepEqual(anchor.resolve(), [0]);
  });

  it('maps a child-boundary recovery with its parent moved before history', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: {
        children: [paragraph('alpha'), paragraph('beta')],
      },
    });
    const anchor = editor.anchor([1, 1], {
      association: 'forward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.insert('!', { at: { path: [1, 0], offset: 2 } });
    });
    editor.update({ history: 'skip', tags: 'remote-change' }, (tx) => {
      tx.nodes.move({ at: [1], to: [0] });
    });

    assert.deepEqual(anchor.resolve(), [0, 1]);
    undo(editor);
    assert.deepEqual(anchor.resolve(), [0, 1]);
    redo(editor);
    assert.deepEqual(anchor.resolve(), [0, 1]);
  });

  it('round-trips the earliest and latest range across automatic text grouping', () => {
    const editor = createEditor({
      extensions: [history({ newBatchDelay: 10_000 })],
      initialValue: { children: [paragraph('ab')] },
    });
    const anchor = editor.anchor(
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 2 },
      },
      { association: 'inward', deletion: 'nearest' }
    );

    editor.update((tx) => {
      tx.text.insert('X', { at: { path: [0, 0], offset: 1 } });
    });
    editor.update((tx) => {
      tx.text.insert('Y', { at: { path: [0, 0], offset: 2 } });
    });

    assert.equal(
      editor.read((state) => state.history.undos().length),
      1
    );
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    });

    undo(editor);
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    });

    redo(editor);
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    });
  });

  it('captures only anchors affected by a distributed edit', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: {
        children: Array.from({ length: 100 }, (_, index) =>
          paragraph(`row-${index}`)
        ),
      },
    });
    const anchors = Array.from({ length: 100 }, (_, index) =>
      editor.anchor(
        {
          anchor: { path: [index, 0], offset: 0 },
          focus: { path: [index, 0], offset: 1 },
        },
        { association: 'inward', deletion: 'nearest' }
      )
    );
    let commitWork:
      | {
          recoveryBytes?: number;
          recoveryEntries?: number;
          visitedAnchors: number;
        }
      | undefined;
    const stop = observeAnchorStateWork(editor, (work) => {
      if (work.phase === 'commit') commitWork = work;
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({
        at: {
          kind: 'text',
          anchor: { path: [50, 0], offset: 0 },
          focus: { path: [50, 0], offset: 1 },
        },
      });
    });

    assert.deepEqual(commitWork, {
      phase: 'commit',
      recoveryBytes: 28,
      recoveryEntries: 1,
      visitedAnchors: 1,
    });
    anchors.forEach((anchor) => anchor.release());
    stop();
  });

  it('does not leak staged recovery from an aborted history action', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: { children: [paragraph('This')] },
    });
    const before = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    } as const;
    const after = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    } as const;
    const anchor = editor.anchor(before, {
      association: 'inward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({ at: { ...before, kind: 'text' } });
    });
    assert.throws(() => {
      editor.update((tx) => {
        tx.history.undo();
        throw new Error('abort');
      });
    }, /abort/);

    editor.update({ history: 'skip' }, (tx) => {
      tx.text.insert('>', { at: { path: [0, 0], offset: 3 } });
    });
    assert.deepEqual(anchor.resolve(), after);

    undo(editor);
    assert.deepEqual(anchor.resolve(), before);
  });

  it('keeps compact recovery exact across a new branch without an interim resolve', () => {
    const editor = createEditor({
      extensions: [history({ newBatchDelay: 0 })],
      initialValue: { children: [paragraph('abcd')] },
    });
    const before = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 2 },
    } as const;
    const anchor = editor.anchor(before, {
      association: 'inward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({ at: { ...before, kind: 'text' } });
    });
    undo(editor);
    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.insert('X', { at: { path: [0, 0], offset: 0 } });
    });

    assert.equal(
      editor.read((state) => state.history.redos().length),
      0
    );
    undo(editor);
    redo(editor);
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 3 },
    });

    undo(editor);
    assert.deepEqual(anchor.resolve(), before);
  });

  it('maps unresolved recovery through a remote skip before redo', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: { children: [paragraph('This')] },
    });
    const before = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    } as const;
    const anchor = editor.anchor(before, {
      association: 'inward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({ at: { ...before, kind: 'text' } });
    });
    undo(editor);
    editor.update({ history: 'skip', tags: 'remote-change' }, (tx) => {
      tx.text.insert('>', { at: { path: [0, 0], offset: 0 } });
    });
    redo(editor);

    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });

    undo(editor);
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 2 },
    });
  });

  it('preserves unresolved backward direction through a skipped edit', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: { children: [paragraph('abcd')] },
    });
    const before = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 1 },
    } as const;
    const anchor = editor.anchor(before, {
      association: 'inward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({ at: { ...before, kind: 'text' } });
    });
    undo(editor);
    editor.update({ history: 'skip' }, (tx) => {
      tx.text.insert('X', { at: { path: [0, 0], offset: 0 } });
    });

    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 2 },
    });
  });

  it('rolls compact recovery back when a following edit aborts', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: { children: [paragraph('This')] },
    });
    const before = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    } as const;
    const anchor = editor.anchor(before, {
      association: 'inward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({ at: { ...before, kind: 'text' } });
    });
    undo(editor);

    assert.throws(() => {
      editor.update({ history: 'new-batch' }, (tx) => {
        tx.text.insert('X', { at: { path: [0, 0], offset: 0 } });
        throw new Error('abort compact recovery');
      });
    }, /abort compact recovery/);
    assert.deepEqual(anchor.resolve(), before);
  });

  it('materializes unresolved recovery before a structural branch', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: {
        children: [paragraph('lead'), paragraph('This')],
      },
    });
    const before = {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 1 },
    } as const;
    const anchor = editor.anchor(before, {
      association: 'inward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({ at: { ...before, kind: 'text' } });
    });
    undo(editor);
    editor.update({ history: 'new-batch' }, (tx) => {
      tx.nodes.insert(paragraph('new'), { at: [0] });
    });
    undo(editor);

    assert.deepEqual(anchor.resolve(), before);

    redo(editor);
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 0], offset: 1 },
    });
  });

  it('keeps a full replacement attached and restores both exact spans', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: { children: [paragraph('This')] },
    });
    const before = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    } as const;
    const after = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    } as const;
    const anchor = editor.anchor(before, {
      association: 'inward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({ at: { ...before, kind: 'text' } });
      tx.text.insert('X', { at: { path: [0, 0], offset: 0 } });
    });

    assert.deepEqual(anchor.resolve(), after);
    undo(editor);
    assert.deepEqual(anchor.resolve(), before);
    redo(editor);
    assert.deepEqual(anchor.resolve(), after);
  });

  it('round-trips an emoji range spanning marked text nodes', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: {
        children: [
          {
            type: 'paragraph',
            children: [{ bold: true, text: 'A😀' }, { text: 'BC' }],
          },
        ],
      },
    });
    const before = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 1], offset: 1 },
    } as const;
    const anchor = editor.anchor(before, {
      association: 'inward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({ at: { ...before, kind: 'text' } });
    });
    const after = structuredClone(anchor.resolve());

    assert.notEqual(after, null);
    undo(editor);
    assert.deepEqual(anchor.resolve(), before);
    redo(editor);
    assert.deepEqual(anchor.resolve(), after);
  });

  it('round-trips exact range paths across a structural split', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: { children: [paragraph('abcd')] },
    });
    const before = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    } as const;
    const anchor = editor.anchor(before, {
      association: 'inward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.nodes.split({ at: { path: [0, 0], offset: 2 } });
    });
    const after = structuredClone(anchor.resolve());

    assert.notEqual(after, null);
    undo(editor);
    assert.deepEqual(anchor.resolve(), before);
    redo(editor);
    assert.deepEqual(anchor.resolve(), after);
  });

  it('round-trips exact range paths across a block merge', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: {
        children: [paragraph('alpha'), paragraph('beta')],
      },
    });
    const before = {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 3 },
    } as const;
    const after = {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 8 },
    } as const;
    const anchor = editor.anchor(before, {
      association: 'inward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.nodes.merge({ at: [1] });
    });

    assert.deepEqual(anchor.resolve(), after);
    undo(editor);
    assert.deepEqual(anchor.resolve(), before);
    redo(editor);
    assert.deepEqual(anchor.resolve(), after);
  });

  it('round-trips exact range paths with a moved block', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: {
        children: [paragraph('alpha'), paragraph('beta')],
      },
    });
    const before = {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 3 },
    } as const;
    const after = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    } as const;
    const anchor = editor.anchor(before, {
      association: 'inward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.nodes.move({ at: [1], to: [0] });
    });

    assert.deepEqual(anchor.resolve(), after);
    undo(editor);
    assert.deepEqual(anchor.resolve(), before);
    redo(editor);
    assert.deepEqual(anchor.resolve(), after);
  });

  it('restores an exact range after its containing block is removed', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: {
        children: [paragraph('alpha'), paragraph('beta')],
      },
    });
    const before = {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 3 },
    } as const;
    const anchor = editor.anchor(before, {
      association: 'inward',
      deletion: 'nearest',
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.nodes.remove({ at: [1] });
    });
    const after = structuredClone(anchor.resolve());

    assert.notEqual(after, null);
    undo(editor);
    assert.deepEqual(anchor.resolve(), before);
    redo(editor);
    assert.deepEqual(anchor.resolve(), after);
  });

  it('round-trips live anchors across seeded structural and lifetime traces', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            first: fc.nat(),
            kind: fc.integer({ max: 7, min: 0 }),
            second: fc.nat(),
          }),
          { maxLength: 60, minLength: 1 }
        ),
        (operations) => {
          const editor = createEditor({
            extensions: [history({ maxDepth: 100, newBatchDelay: 0 })],
            initialValue: {
              children: [
                paragraph('alpha'),
                paragraph('bravo'),
                paragraph('charlie'),
              ],
            },
          });
          const anchors: Array<Anchor<Range>> = [];
          const textEntries = () =>
            editor.read((state) =>
              state.nodes.toArray({ at: [], match: TextApi.isText })
            );
          const createRangeAnchor = (first: number, second: number) => {
            const entries = textEntries();
            const entry = entries[first % entries.length];

            assert.ok(entry);
            const [text, path] = entry;
            const firstOffset = first % (text.text.length + 1);
            const secondOffset = second % (text.text.length + 1);
            const forward = first % 2 === 0;
            const start = Math.min(firstOffset, secondOffset);
            const end = Math.max(firstOffset, secondOffset);
            const range = {
              anchor: { path, offset: forward ? start : end },
              focus: { path, offset: forward ? end : start },
            };

            anchors.push(
              editor.anchor(range, {
                association: 'inward',
                deletion: 'nearest',
              })
            );
          };

          createRangeAnchor(0, 3);
          createRangeAnchor(1, 4);

          for (const operation of operations) {
            if (operation.kind === 6) {
              createRangeAnchor(operation.first, operation.second);
              continue;
            }
            if (operation.kind === 7) {
              const index = operation.first % Math.max(anchors.length, 1);
              const [released] = anchors.splice(index, 1);

              if (released) {
                released.release();
                assert.equal(released.resolve(), null);
              }
              continue;
            }

            const before = anchors.map((anchor) =>
              structuredClone(anchor.resolve())
            );
            const entries = textEntries();
            const entry = entries[operation.first % entries.length];

            assert.ok(entry);
            const [text, path] = entry;
            const blockCount = editor.read.value().children.length;

            editor.update({ history: 'new-batch' }, (tx) => {
              if (operation.kind === 0 || text.text.length === 0) {
                tx.text.insert('x', {
                  at: {
                    path,
                    offset: operation.second % (text.text.length + 1),
                  },
                });
                return;
              }
              if (operation.kind === 1) {
                const offset = operation.second % text.text.length;

                tx.text.delete({
                  at: {
                    kind: 'text',
                    anchor: { path, offset },
                    focus: { path, offset: offset + 1 },
                  },
                });
                return;
              }
              if (operation.kind === 2 && text.text.length > 1) {
                tx.nodes.split({
                  at: {
                    path,
                    offset: 1 + (operation.second % (text.text.length - 1)),
                  },
                });
                return;
              }
              if (operation.kind === 3 && (path.at(-1) ?? 0) > 0) {
                tx.nodes.merge({ at: path });
                return;
              }
              if (operation.kind === 4 && blockCount > 1) {
                const from = 1 + (operation.first % (blockCount - 1));

                tx.nodes.move({ at: [from], to: [0] });
                return;
              }
              if (operation.kind === 5 && blockCount > 1) {
                const block = 1 + (operation.first % (blockCount - 1));

                tx.nodes.remove({ at: [block] });
                return;
              }

              tx.text.insert('z', {
                at: { path, offset: operation.second % (text.text.length + 1) },
              });
            });
            const after = anchors.map((anchor) =>
              structuredClone(anchor.resolve())
            );

            undo(editor);
            assert.deepEqual(
              anchors.map((anchor) => anchor.resolve()),
              before
            );
            redo(editor);
            assert.deepEqual(
              anchors.map((anchor) => anchor.resolve()),
              after
            );
          }

          anchors.forEach((anchor) => anchor.release());
        }
      ),
      { numRuns: 40, seed: 20_260_903 }
    );
  });

  it('matches eager recovery while compact recovery crosses mixed text history', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            kind: fc.integer({ max: 5, min: 0 }),
            observe: fc.boolean(),
            position: fc.nat(),
          }),
          { maxLength: 80, minLength: 1 }
        ),
        (operations) => {
          const create = () =>
            createEditor({
              extensions: [history({ maxDepth: 100, newBatchDelay: 0 })],
              initialValue: { children: [paragraph('abcdefgh')] },
            });
          const eagerEditor = create();
          const compactEditor = create();
          const initialRange = {
            anchor: { path: [0, 0], offset: 1 },
            focus: { path: [0, 0], offset: 7 },
          } as const;
          const eager = eagerEditor.anchor(initialRange, {
            association: 'inward',
            deletion: 'nearest',
          });
          const compact = compactEditor.anchor(initialRange, {
            association: 'inward',
            deletion: 'nearest',
          });
          const forBoth = (run: (editor: Editor) => void) => {
            run(eagerEditor);
            run(compactEditor);
          };

          forBoth((editor) => {
            editor.update({ history: 'new-batch' }, (tx) => {
              tx.text.delete({ at: { ...initialRange, kind: 'text' } });
            });
            undo(editor);
          });
          eager.resolve();

          for (const [index, operation] of operations.entries()) {
            const text = eagerEditor.read.text.string([]);
            const position = operation.position % (text.length + 1);

            if (operation.kind === 3) {
              if (
                eagerEditor.read((state) => state.history.undos().length) > 0
              ) {
                forBoth(undo);
              }
            } else if (operation.kind === 4) {
              if (
                eagerEditor.read((state) => state.history.redos().length) > 0
              ) {
                forBoth(redo);
              }
            } else {
              forBoth((editor) => {
                editor.update(
                  { history: operation.kind === 5 ? 'skip' : 'new-batch' },
                  (tx) => {
                    if (operation.kind === 0 || text.length === 0) {
                      tx.text.insert('x', {
                        at: { path: [0, 0], offset: position },
                      });
                      return;
                    }

                    const from = Math.min(position, text.length - 1);
                    const at = {
                      kind: 'text' as const,
                      anchor: { path: [0, 0], offset: from },
                      focus: { path: [0, 0], offset: from + 1 },
                    };

                    tx.text.delete({ at });
                    if (operation.kind === 2) {
                      tx.text.insert('z', {
                        at: { path: [0, 0], offset: from },
                      });
                    }
                  }
                );
              });
            }

            const expected = structuredClone(eager.resolve());

            assert.deepEqual(
              compactEditor.read.value(),
              eagerEditor.read.value()
            );
            if (operation.observe || index === operations.length - 1) {
              assert.deepEqual(compact.resolve(), expected);
            }
          }
        }
      ),
      { numRuns: 50, seed: 20_260_904 }
    );
  });

  it('matches exact recorded anchor states across seeded mixed history traces', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            kind: fc.integer({ max: 4, min: 0 }),
            position: fc.nat(),
          }),
          { maxLength: 50, minLength: 1 }
        ),
        (operations) => {
          const editor = createEditor({
            extensions: [history({ maxDepth: 100, newBatchDelay: 0 })],
            initialValue: { children: [paragraph('abcdefgh')] },
          });
          const anchor = editor.anchor(
            {
              anchor: { path: [0, 0], offset: 1 },
              focus: { path: [0, 0], offset: 7 },
            },
            { association: 'inward', deletion: 'nearest' }
          );
          const undos: Array<{
            after: ReturnType<typeof anchor.resolve>;
            before: ReturnType<typeof anchor.resolve>;
            textAfter: string;
            textBefore: string;
          }> = [];
          const redos: typeof undos = [];
          let text = 'abcdefgh';

          for (const operation of operations) {
            if (operation.kind === 3) {
              const entry = undos.pop();

              if (!entry) continue;
              undo(editor);
              redos.push(entry);
              text = entry.textBefore;
              assert.deepEqual(anchor.resolve(), entry.before);
              continue;
            }
            if (operation.kind === 4) {
              const entry = redos.pop();

              if (!entry) continue;
              redo(editor);
              undos.push(entry);
              text = entry.textAfter;
              assert.deepEqual(anchor.resolve(), entry.after);
              continue;
            }

            const before = structuredClone(anchor.resolve());
            const textBefore = text;
            const position = operation.position % (text.length + 1);

            editor.update({ history: 'new-batch' }, (tx) => {
              if (operation.kind === 0 || text.length === 0) {
                tx.text.insert('x', {
                  at: { path: [0, 0], offset: position },
                });
                text = `${text.slice(0, position)}x${text.slice(position)}`;
                return;
              }

              const from = Math.min(position, text.length - 1);
              const at = {
                kind: 'text' as const,
                anchor: { path: [0, 0], offset: from },
                focus: { path: [0, 0], offset: from + 1 },
              };

              tx.text.delete({ at });
              text = `${text.slice(0, from)}${text.slice(from + 1)}`;
              if (operation.kind === 2) {
                tx.text.insert('z', {
                  at: { path: [0, 0], offset: from },
                });
                text = `${text.slice(0, from)}z${text.slice(from)}`;
              }
            });

            undos.push({
              after: structuredClone(anchor.resolve()),
              before,
              textAfter: text,
              textBefore,
            });
            redos.length = 0;
          }
        }
      ),
      { numRuns: 50, seed: 20_260_903 }
    );
  });
});
