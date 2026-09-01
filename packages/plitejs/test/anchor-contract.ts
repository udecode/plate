import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type Anchor,
  createEditor,
  createEditorView,
  DocumentChange,
  type Element,
  NodeApi,
  type Path,
  type Point,
  type Range,
} from 'plitejs';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('canonical anchor contract', () => {
  it('maps repeated endpoints once per change without sharing handle values', () => {
    const editor = createEditor({
      initialValue: [paragraph('abcdefghijk'), paragraph('unrelated')],
    });
    const anchors = Array.from({ length: 100 }, () =>
      editor.anchor(
        {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 8 },
        },
        { association: 'inward', deletion: 'drop' }
      )
    );
    const original = DocumentChange.prototype.mapPosition;
    let mappings = 0;
    DocumentChange.prototype.mapPosition = function mapPosition(...args) {
      mappings += 1;
      return original.apply(this, args);
    };
    try {
      editor.update.text.insert('x', { at: { path: [0, 0], offset: 0 } });
      assert.ok(mappings <= 4, `Repeated endpoints mapped ${mappings} times`);
      const saved = anchors[0].resolve();
      assert.deepEqual(saved, {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 9 },
      });
      for (const anchor of anchors.slice(1)) {
        assert.deepEqual(anchor.resolve(), saved);
        assert.notEqual(anchor.resolve()?.anchor, saved?.anchor);
        assert.notEqual(anchor.resolve()?.anchor.path, saved?.anchor.path);
      }
      editor.update.text.insert('x', { at: { path: [1, 0], offset: 0 } });
      assert.equal(anchors[0].resolve(), saved);
      mappings = 0;
      editor.update.text.insert('y', { at: { path: [0, 0], offset: 0 } });
      assert.ok(mappings <= 4, `Follow-up endpoints mapped ${mappings} times`);
      assert.deepEqual(anchors[0].resolve(), {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 10 },
      });
      assert.equal(saved?.anchor.offset, 1);
    } finally {
      DocumentChange.prototype.mapPosition = original;
      anchors.forEach((anchor) => anchor.release());
    }
  });

  it('keeps memoized endpoint associations and named roots independent', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('abcdefghijk')],
        roots: { header: [paragraph('abcdefghijk')] },
      },
    });
    const range = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 8 },
    };
    const inward = editor.anchor(range, { association: 'inward' });
    const outward = editor.anchor(range, { association: 'outward' });
    const backward = editor.anchor(
      { anchor: range.focus, focus: range.anchor },
      { association: 'inward' }
    );
    const header = editor.anchor(range, {
      association: 'inward',
      root: 'header',
    });
    editor.update((tx) => {
      tx.text.insert('x', { at: { path: [0, 0], offset: 0 } });
      tx.text.insert('y', { at: { path: [0, 0], offset: 8, root: 'header' } });
    });
    assert.deepEqual(inward.resolve(), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 9 },
    });
    assert.deepEqual(outward.resolve(), {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 9 },
    });
    assert.deepEqual(backward.resolve(), {
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 1 },
    });
    assert.deepEqual(header.resolve(), range);
    [inward, outward, backward, header].forEach((anchor) => anchor.release());
  });

  it('rejects an explicit primary root key', () => {
    const editor = createEditor({ initialValue: [paragraph('one')] });

    assert.throws(
      () =>
        Reflect.apply(editor.anchor, editor, [
          [],
          { deletion: 'nearest', root: 'main' },
        ]),
      /Omit root to target the primary document/
    );

    assert.throws(
      () =>
        Reflect.apply(editor.anchor, editor, [
          { offset: 0, path: [0, 0], root: 'main' },
          { deletion: 'nearest' },
        ]),
      /Omit root to target the primary document/
    );
  });

  it('keeps the primary root implicit in public anchor metadata', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });
    const primary = editor.anchor([], { deletion: 'nearest' });
    const header = editor.anchor([], {
      deletion: 'nearest',
      root: 'header',
    });

    assert.equal(primary.root, undefined);
    assert.equal(header.root, 'header');
  });

  it('creates anchors from the transaction current state', () => {
    const editor = createEditor({ initialValue: [paragraph('one')] });
    let anchor: Anchor<Path> | null = null;

    editor.update((tx) => {
      tx.nodes.insert(paragraph('two'), { at: [1] });
      anchor = editor.anchor([1], {
        association: 'forward',
        deletion: 'drop',
      });
      tx.nodes.insert(paragraph('zero'), { at: [0] });
    });

    assert.deepEqual(anchor!.release(), [2]);
  });

  it('maps transaction anchors and expires them with the callback', () => {
    const editor = createEditor({ initialValue: [paragraph('one')] });
    const leaked: Array<Readonly<{ resolve: () => unknown }>> = [];

    editor.update((tx) => {
      const path = tx.anchor([0], {
        association: 'forward',
        deletion: 'drop',
      });
      const point = tx.anchor(
        { offset: 1, path: [0, 0] },
        { association: 'forward', deletion: 'nearest' }
      );
      const range = tx.anchor(
        {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
        { association: 'inward', deletion: 'nearest' }
      );

      tx.nodes.insert(paragraph('zero'), { at: [0] });

      assert.deepEqual(path.resolve(), [1]);
      assert.deepEqual(point.resolve(), { offset: 1, path: [1, 0] });
      assert.deepEqual(range.resolve(), {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 2, path: [1, 0] },
      });
      leaked.push(path, point, range);
    });

    for (const anchor of leaked) {
      assert.throws(() => anchor.resolve(), /no longer active/);
    }
  });

  it('maps point and range affinities through a draft text split', () => {
    const editor = createEditor({ initialValue: [paragraph('old')] });
    let backwardPoints: Point[] = [];
    let forwardPoints: Point[] = [];
    let ranges: Range[] = [];

    editor.update((tx) => {
      tx.value.replace({
        children: [paragraph('abc')],
        selection: null,
      });

      const offsets = [0, 1, 2];
      const backward = offsets.map((offset) =>
        tx.anchor(
          { path: [0, 0], offset },
          { association: 'backward', deletion: 'nearest' }
        )
      );
      const forward = offsets.map((offset) =>
        tx.anchor(
          { path: [0, 0], offset },
          { association: 'forward', deletion: 'nearest' }
        )
      );
      const selected = tx.anchor(
        {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 2 },
        },
        { association: 'inward', deletion: 'nearest' }
      );
      const outward = tx.anchor(
        {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 1 },
        },
        { association: 'outward', deletion: 'nearest' }
      );
      const backwardRange = tx.anchor(
        {
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 0 },
        },
        { association: 'inward', deletion: 'nearest' }
      );

      tx.nodes.split({
        always: true,
        at: { path: [0, 0], offset: 1 },
        match: NodeApi.isText,
      });

      backwardPoints = backward.map((anchor) => anchor.resolve()!);
      forwardPoints = forward.map((anchor) => anchor.resolve()!);
      ranges = [
        selected.resolve()!,
        outward.resolve()!,
        backwardRange.resolve()!,
      ];
    });

    assert.deepEqual(backwardPoints, [
      { path: [0, 0], offset: 0 },
      { path: [0, 0], offset: 1 },
      { path: [0, 1], offset: 1 },
    ]);
    assert.deepEqual(forwardPoints, [
      { path: [0, 0], offset: 0 },
      { path: [0, 1], offset: 0 },
      { path: [0, 1], offset: 1 },
    ]);
    assert.deepEqual(ranges, [
      {
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 1 },
      },
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 1], offset: 0 },
      },
      {
        anchor: { path: [0, 1], offset: 1 },
        focus: { path: [0, 0], offset: 0 },
      },
    ]);
  });

  it('rebases anchors through directly applied document changes', () => {
    const initialValue = [paragraph('one'), paragraph('two')];
    const source = createEditor({ initialValue });

    source.update((tx) => {
      tx.nodes.insert(paragraph('zero'), { at: [0] });
    });

    const change = source.read.lastCommit()?.changes;

    assert.ok(change);

    const target = createEditor({ initialValue });
    const anchor = target.anchor([1], {
      association: 'forward',
      deletion: 'drop',
    });
    target.update.selection.set({ path: [1, 0], offset: 2 });

    target.update((tx) => {
      tx.changes.apply(change);
    });

    assert.deepEqual(anchor.release(), [2]);
    assert.deepEqual(target.read.selection(), {
      anchor: { path: [2, 0], offset: 2 },
      focus: { path: [2, 0], offset: 2 },
    });
  });

  it('drops deleted path anchors instead of retargeting a sibling', () => {
    const editor = createEditor({
      initialValue: [paragraph('one'), paragraph('two')],
    });
    const anchor = editor.anchor([0], {
      association: 'forward',
      deletion: 'drop',
    });

    editor.update.nodes.remove({ at: [0] });

    assert.equal(anchor.release(), null);
  });

  it('maps selections out of deleted nodes through direct changes', () => {
    const initialValue = [paragraph('one'), paragraph('two')];
    const source = createEditor({ initialValue });

    source.update.nodes.remove({ at: [0] });

    const change = source.read.lastCommit()?.changes;

    assert.ok(change);

    const target = createEditor({ initialValue });

    target.update.selection.set({ path: [0, 0], offset: 2 });
    target.update((tx) => {
      tx.changes.apply(change);
    });

    assert.deepEqual(target.read.selection(), {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('keeps the document root stable across structural edits', () => {
    const editor = createEditor({ initialValue: [paragraph('one')] });
    const root = editor.anchor([], {
      association: 'forward',
      deletion: 'drop',
    });

    editor.update((tx) => {
      tx.nodes.insert(paragraph('two'), { at: [1] });
      tx.nodes.remove({ at: [0] });
    });

    assert.deepEqual(root.release(), []);
    assert.equal(root.resolve(), null);
    assert.equal(root.release(), null);
  });

  it('tracks path and range identity through node moves', () => {
    const editor = createEditor({
      initialValue: [paragraph('one'), paragraph('two')],
    });
    const path = editor.anchor([0], {
      association: 'forward',
      deletion: 'drop',
    });
    const range = editor.anchor(
      {
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 3 },
      },
      { association: 'inward', deletion: 'drop' }
    );

    editor.update((tx) => {
      tx.nodes.move({ at: [0], to: [2] });
    });

    assert.deepEqual(path.resolve(), [1]);
    assert.deepEqual(range.resolve(), {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 3 },
    });
  });

  it('rebases rootless view intents against the active document root', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });
    const header = createEditorView(runtime, { root: 'header' });
    const anchor = header.anchor(
      { path: [0, 0], offset: 3 },
      { association: 'forward', deletion: 'nearest' }
    );

    header.update((tx) => {
      tx.text.insert('X', { at: { path: [0, 0], offset: 1 } });
    });

    assert.deepEqual(anchor.release(), { path: [0, 0], offset: 4 });
  });

  it('maps point offsets through text changes and drops deleted content', () => {
    const editor = createEditor({ initialValue: [paragraph('abcd')] });
    const mapped = editor.anchor(
      { path: [0, 0], offset: 2 },
      { association: 'forward', deletion: 'nearest' }
    );
    const deleted = editor.anchor(
      { path: [0, 0], offset: 2 },
      { association: 'forward', deletion: 'drop' }
    );

    editor.update((tx) => {
      tx.text.insert('X', { at: { path: [0, 0], offset: 1 } });
    });

    assert.deepEqual(mapped.resolve(), { path: [0, 0], offset: 3 });
    assert.deepEqual(deleted.resolve(), { path: [0, 0], offset: 3 });

    editor.update((tx) => {
      tx.text.delete({
        at: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 4 },
        },
      });
    });

    assert.deepEqual(mapped.release(), { path: [0, 0], offset: 2 });
    assert.equal(deleted.release(), null);
  });

  it('maps an unread point and range after an unrelated earlier text edit', () => {
    const editor = createEditor({
      initialValue: [paragraph('abc'), paragraph('hello')],
    });
    const point = editor.anchor(
      { path: [1, 0], offset: 2 },
      { association: 'forward', deletion: 'nearest' }
    );
    const range = editor.anchor(
      {
        anchor: { path: [1, 0], offset: 1 },
        focus: { path: [1, 0], offset: 4 },
      },
      { association: 'inward', deletion: 'drop' }
    );

    editor.update.text.insert('abcabcabc', {
      at: { path: [0, 0], offset: 0 },
    });
    editor.update.text.insert('X', { at: { path: [1, 0], offset: 0 } });

    assert.deepEqual(point.release(), { path: [1, 0], offset: 3 });
    assert.deepEqual(range.release(), {
      anchor: { path: [1, 0], offset: 2 },
      focus: { path: [1, 0], offset: 5 },
    });
  });

  it('maps an unread child boundary after an unrelated text edit', () => {
    const editor = createEditor({
      initialValue: [paragraph('abc'), paragraph('hello')],
    });
    const end = editor.anchor([2], {
      association: 'forward',
      deletion: 'nearest',
    });

    editor.update.text.insert('abcabcabc', {
      at: { path: [0, 0], offset: 0 },
    });
    editor.update.nodes.insert(paragraph('last'), { at: [2] });

    assert.deepEqual(end.release(), [3]);
  });

  it('maps a named-root anchor after skipped edits and a structural shift', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('abc'), paragraph('hello')] },
      },
    });
    const header = createEditorView(runtime, { root: 'header' });
    const point = header.anchor(
      { path: [1, 0], offset: 2 },
      { association: 'forward', deletion: 'nearest' }
    );

    runtime.update.text.insert('unrelated', {
      at: { path: [0, 0], offset: 0 },
    });
    header.update.text.insert('abcabcabc', {
      at: { path: [0, 0], offset: 0 },
    });
    header.update.nodes.insert(paragraph('first'), { at: [0] });
    header.update.text.insert('X', { at: { path: [2, 0], offset: 0 } });

    assert.deepEqual(point.release(), { path: [2, 0], offset: 3 });
  });

  it('keeps an unchanged range shape across skipped edits and reads', () => {
    const editor = createEditor({
      initialValue: [paragraph('abc'), paragraph('hello')],
    });
    const value = {
      kind: 'text' as const,
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 4 },
    };
    const range = editor.anchor(value, { deletion: 'drop' });

    editor.update.text.insert('abcabcabc', {
      at: { path: [0, 0], offset: 0 },
    });

    assert.deepEqual(range.resolve(), value);
    assert.deepEqual(range.release(), value);
    assert.equal(range.resolve(), null);
  });
});
