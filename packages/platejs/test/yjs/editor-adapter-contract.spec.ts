import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getEditorLiveSelection } from '#platejs-test-internal';

import {
  createEditor,
  type Descendant,
  type Editor,
  SelectionApi,
} from '../../src/core';
import { createYjsEditorAdapter } from '../../src/yjs/core/editor-adapter';
import {
  createSeededYjsPeers,
  createYjsTestEditor,
  paragraph,
  syncConnectedPeers,
} from './support/collaboration';

describe('platejs/yjs editor adapter', () => {
  it('fits changed blocks without per-block live-document transactions', () => {
    const [source, target] = createSeededYjsPeers({
      children: Array.from({ length: 128 }, (_, index) =>
        paragraph(`block-${index}`)
      ),
      clientIds: ['source', 'target'],
    });
    assert.ok(source);
    assert.ok(target);
    const before = target.editor.read.value();
    const unchanged = before.children[127];
    source.editor.update((tx) => {
      for (let index = 0; index < 24; index++) {
        tx.text.insert('!', { at: { path: [index, 0], offset: 0 } });
      }
    });
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        acceptsCoreDuration?: (id: string) => boolean;
        record?: (event: { id?: string | null; kind: string }) => void;
      };
    };
    const previousProfiler = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
    let detachedTransactions = 0;
    profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
      acceptsCoreDuration: (id) => id === 'transaction-spec-callback',
      record(event) {
        if (
          event.kind === 'core-time' &&
          event.id === 'transaction-spec-callback'
        ) {
          detachedTransactions += 1;
        }
      },
    };
    try {
      syncConnectedPeers([source, target]);
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }
    assert.deepEqual(
      target.editor.read.children(),
      source.editor.read.children()
    );
    assert.equal(target.editor.read.children()[127], unchanged);
    assert.deepEqual(before.children[0], paragraph('block-0'));
    assert.equal(detachedTransactions, 0);

    source.editor.update.text.insert('?', {
      at: { path: [127, 0], offset: 0 },
    });
    syncConnectedPeers([source, target]);
    assert.deepEqual(
      target.editor.read.children()[127],
      paragraph('?block-127')
    );
    assert.deepEqual(unchanged, paragraph('block-127'));
    source.cleanup();
    target.cleanup();
    source.doc.destroy();
    target.doc.destroy();
  });

  it('reads 10k and 50k published roots without copying them', () => {
    for (const size of [10_000, 50_000]) {
      const children: readonly Descendant[] = Object.freeze(
        Array.from({ length: size }, (_, index) => ({
          children: [{ text: String(index) }],
          type: 'paragraph',
        }))
      );
      let reads = 0;
      const editor = {
        read: {
          value: () => {
            reads += 1;

            return { children, roots: { header: children } };
          },
        },
      } as unknown as Editor;
      const adapter = createYjsEditorAdapter(editor, (_root, value) => value);

      assert.equal(adapter.readChildren('main'), children);
      assert.equal(adapter.readChildren('header'), children);
      assert.equal(reads, 2);
    }
  });

  it('preserves exact node selections during remote import', () => {
    const editor = createYjsTestEditor({
      children: [
        { children: [{ text: 'one' }], type: 'paragraph' },
        { children: [{ text: 'two' }], type: 'paragraph' },
      ],
      roots: {
        header: [{ children: [{ text: 'header' }], type: 'paragraph' }],
      },
    });
    const adapter = createYjsEditorAdapter(editor, (_root, value) => value);

    editor.update.selection.set(SelectionApi.nodes([[0]]));
    adapter.applyRemote({ effects: [], selection: null });
    assert.equal(editor.read.selection(), null);

    adapter.applyRemote({
      effects: [],
      selection: SelectionApi.nodes([[0], [1]]),
    });
    assert.deepEqual(
      getEditorLiveSelection(editor),
      SelectionApi.nodes([[0], [1]])
    );

    adapter.applyRemote({
      effects: [],
      selection: SelectionApi.nodes([[0]], { root: 'header' }),
    });
    assert.deepEqual(
      getEditorLiveSelection(editor),
      SelectionApi.nodes([[0]], { root: 'header' })
    );
  });

  it('clears stale and unsupported remote selections', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
    });
    const adapter = createYjsEditorAdapter(editor, (_root, value) => value);

    adapter.applyRemote({
      effects: [],
      selection: SelectionApi.nodes([[9]]),
    });
    assert.equal(editor.read.selection(), null);

    adapter.applyRemote({
      effects: [],
      selection: {
        kind: 'node',
        paths: [[0]],
      } as never,
    });
    assert.equal(editor.read.selection(), null);
  });
});
