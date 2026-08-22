import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  SelectionApi,
  type TransactionSpec,
} from '@platejs/plite';
import { getNodeKeyDOMValue } from '@platejs/plite/internal';

import { applyTransactionSpec } from '../src/core/public-state';

const createTextEditor = (text = 'ab') =>
  createEditor({
    initialSelection: SelectionApi.text({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    }),
    initialValue: [{ type: 'paragraph', children: [{ text }] }],
  });

const createInsertSpec = (
  editor: ReturnType<typeof createTextEditor>,
  text = '!'
) =>
  editor.read((state) =>
    state.transaction((tx) => {
      tx.text.insert(text);

      assert.equal(editor.read.text.string([]), 'ab');
      assert.equal(tx.text.string([]), `a${text}b`);
    })
  );

describe('native transaction spec contract', () => {
  it('builds against a detached draft while ambient editor reads stay committed', () => {
    const editor = createTextEditor();
    let commits = 0;
    const profiledIds: string[] = [];
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record?: (event: { id: string; kind: string }) => void;
      };
    };
    const previousProfiler = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
    let spec: TransactionSpec;

    editor.subscribeCommit(() => (commits += 1) - 1);

    try {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
        record(event) {
          if (event.kind === 'core-time') profiledIds.push(event.id);
        },
      };

      spec = createInsertSpec(editor);

      assert.equal(editor.read.text.string([]), 'ab');

      editor.update(() => applyTransactionSpec(editor, spec));
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    assert.equal(editor.read.text.string([]), 'a!b');
    assert.equal(commits, 1);
    assert.equal(
      profiledIds.filter((id) => id === 'transaction-node-keys').length,
      1
    );
    assert.equal(
      profiledIds.filter((id) => id === 'transaction-callback').length,
      1
    );
  });

  it('does not consume node keys while building a discarded structural spec', () => {
    const withDiscardedSpec = createTextEditor();
    const control = createTextEditor();

    for (const editor of [withDiscardedSpec, control]) {
      assert.ok(editor.key([0]));
      assert.ok(editor.key([0, 0]));
    }

    withDiscardedSpec.read((state) =>
      state.transaction((tx) => {
        tx.nodes.insert(
          { type: 'paragraph', children: [{ text: 'discarded' }] },
          { at: [1] }
        );
      })
    );

    for (const editor of [withDiscardedSpec, control]) {
      editor.update((tx) => {
        tx.nodes.insert(
          { type: 'paragraph', children: [{ text: 'published' }] },
          { at: [1] }
        );
      });
    }

    assert.equal(
      getNodeKeyDOMValue(withDiscardedSpec.key([1])!),
      getNodeKeyDOMValue(control.key([1])!)
    );
    assert.equal(
      getNodeKeyDOMValue(withDiscardedSpec.key([1, 0])!),
      getNodeKeyDOMValue(control.key([1, 0])!)
    );
  });

  it('keeps a prepared spec reusable after its first application rolls back', () => {
    const editor = createTextEditor();
    const spec = createInsertSpec(editor);
    let commits = 0;

    editor.subscribeCommit(() => (commits += 1) - 1);
    assert.throws(
      () =>
        editor.update(() => {
          applyTransactionSpec(editor, spec);
          throw new Error('abort');
        }),
      /abort/
    );
    assert.equal(editor.read.text.string([]), 'ab');

    editor.update(() => applyTransactionSpec(editor, spec));

    assert.equal(editor.read.text.string([]), 'a!b');
    assert.equal(commits, 1);
  });

  it('rejects repeated and sibling base specs without publishing either draft', () => {
    for (const sibling of [false, true]) {
      const editor = createTextEditor();
      const first = createInsertSpec(editor);
      const second = sibling ? createInsertSpec(editor, '?') : first;
      let commits = 0;

      editor.subscribeCommit(() => (commits += 1) - 1);
      assert.throws(
        () =>
          editor.update(() => {
            applyTransactionSpec(editor, first);
            applyTransactionSpec(editor, second);
          }),
        /stale transaction spec/
      );
      assert.equal(editor.read.text.string([]), 'ab');
      assert.equal(commits, 0);
    }
  });

  it('rejects stale and cross-editor specs before mutation', () => {
    const source = createTextEditor();
    const other = createTextEditor();
    const stale = createInsertSpec(source);

    assert.throws(
      () => other.update(() => applyTransactionSpec(other, stale)),
      /different editor/
    );
    assert.equal(other.read.text.string([]), 'ab');

    source.update.text.insert('x');

    assert.throws(
      () => source.update(() => applyTransactionSpec(source, stale)),
      /stale transaction spec/
    );
    assert.equal(source.read.text.string([]), 'axb');
  });
});
