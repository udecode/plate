import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  type Element,
  SelectionApi,
} from '@platejs/plite';
import { applyTransactionSpec } from '../src/core/public-state';

const paragraph = (text: string): Element => ({
  children: [{ text }],
  type: 'paragraph',
});

const createTextEditor = () =>
  createEditor({
    initialSelection: SelectionApi.text({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    }),
    initialValue: [paragraph('ab')],
  });

describe('slice and fragment public APIs', () => {
  it('applies a fitted spec with direct slice and closed-fragment parity', () => {
    const previewEditor = createTextEditor();
    const sliceEditor = createTextEditor();
    const fragmentEditor = createTextEditor();
    const slice = ContentSlice.closed([{ text: '!' }]);
    let previewCommits = 0;
    let sliceCommits = 0;
    let fragmentCommits = 0;

    previewEditor.subscribeCommit(() => previewCommits++);
    sliceEditor.subscribeCommit(() => sliceCommits++);
    fragmentEditor.subscribeCommit(() => fragmentCommits++);

    const spec = previewEditor.read.slice.fit(slice);

    assert.ok(spec);
    assert.equal(previewEditor.read.text.string([]), 'ab');
    assert.equal(previewCommits, 0);

    previewEditor.update(() => applyTransactionSpec(previewEditor, spec));
    sliceEditor.update.slice.replace(slice);
    fragmentEditor.update.fragment.replace([{ text: '!' }]);

    const previewSnapshot = previewEditor.read.runtime.snapshot();
    const sliceSnapshot = sliceEditor.read.runtime.snapshot();
    const fragmentSnapshot = fragmentEditor.read.runtime.snapshot();

    assert.deepEqual(previewSnapshot.children, sliceSnapshot.children);
    assert.deepEqual(previewSnapshot.children, fragmentSnapshot.children);
    assert.deepEqual(previewSnapshot.selection, sliceSnapshot.selection);
    assert.deepEqual(previewSnapshot.selection, fragmentSnapshot.selection);
    assert.equal(previewCommits, 1);
    assert.equal(sliceCommits, 1);
    assert.equal(fragmentCommits, 1);
  });

  it('returns false without publishing for an unresolved target', () => {
    const editor = createTextEditor();
    const before = editor.read.runtime.snapshot();
    let commits = 0;

    editor.subscribeCommit(() => commits++);

    const result = editor.read.slice.fit(ContentSlice.closed([{ text: '!' }]), {
      at: [99],
    });

    assert.equal(result, false);
    assert.equal(commits, 0);
    assert.deepEqual(editor.read.runtime.snapshot(), before);
  });
});
