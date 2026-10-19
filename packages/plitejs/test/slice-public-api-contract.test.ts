import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  type Element,
  SelectionApi,
} from 'plitejs';

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
  for (const method of ['fragment', 'closed slice', 'open slice'] as const) {
    for (const backward of [false, true]) {
      it(`replaces a ${backward ? 'backward' : 'forward'} partial cross-block range with a ${method}`, () => {
        const start = { path: [0, 0], offset: 1 };
        const end = { path: [1, 0], offset: 2 };
        const editor = createEditor({
          initialSelection: SelectionApi.text({
            anchor: backward ? end : start,
            focus: backward ? start : end,
          }),
          initialValue: [paragraph('one'), paragraph('two'), paragraph('tail')],
        });
        const content = [paragraph('NEW'), paragraph('LAST')];
        let applied = false;

        editor.update((tx) => {
          applied =
            method === 'fragment'
              ? tx.fragment.replace(content)
              : tx.slice.replace(
                  method === 'closed slice'
                    ? ContentSlice.closed(content)
                    : ContentSlice.fromJSON({
                        content,
                        openStart: 1,
                        openEnd: 1,
                      })
                );
        });

        assert.equal(applied, true);
        assert.deepEqual(editor.read.children(), [
          paragraph('oNEW'),
          paragraph('LASTo'),
          paragraph('tail'),
        ]);
        assert.deepEqual(editor.read.selection(), {
          anchor: { path: [1, 0], offset: 4 },
          focus: { path: [1, 0], offset: 4 },
        });
      });
    }

    it(`keeps the unselected suffix when only the last endpoint is partial with ${method}`, () => {
      const editor = createEditor({
        initialSelection: SelectionApi.text({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [1, 0], offset: 3 },
        }),
        initialValue: [paragraph('a'), paragraph('twotail')],
      });
      const content = [paragraph('NEW')];

      editor.update((tx) => {
        assert.equal(
          method === 'fragment'
            ? tx.fragment.replace(content)
            : tx.slice.replace(
                method === 'closed slice'
                  ? ContentSlice.closed(content)
                  : ContentSlice.fromJSON({ content, openStart: 1, openEnd: 1 })
              ),
          true
        );
      });

      assert.deepEqual(editor.read.children(), [paragraph('NEWtail')]);
    });

    it(`preserves surviving marks across text leaves with a ${method}`, () => {
      const editor = createEditor({
        initialSelection: SelectionApi.text({
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 1], offset: 2 },
        }),
        initialValue: [
          {
            type: 'paragraph',
            children: [{ text: 'one', bold: true }, { text: 'two' }],
          },
        ],
      });
      const content = [paragraph('NEW')];

      editor.update((tx) => {
        assert.equal(
          method === 'fragment'
            ? tx.fragment.replace(content)
            : tx.slice.replace(
                method === 'closed slice'
                  ? ContentSlice.closed(content)
                  : ContentSlice.fromJSON({ content, openStart: 1, openEnd: 1 })
              ),
          true
        );
      });

      assert.deepEqual(editor.read.children(), [
        {
          type: 'paragraph',
          children: [{ text: 'o', bold: true }, { text: 'NEWo' }],
        },
      ]);
      assert.deepEqual(editor.read.selection(), {
        anchor: { path: [0, 1], offset: 3 },
        focus: { path: [0, 1], offset: 3 },
      });
    });
  }

  it('reuses immutable root nodes for a complete-root export', () => {
    const first = paragraph('first');
    const second = paragraph('second');
    const editor = createEditor({
      initialSelection: SelectionApi.text({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 6, path: [1, 0] },
      }),
      initialValue: [first, second],
    });
    const children = editor.read.children();
    const slice = editor.read.slice.export();

    assert.equal(slice.content[0], children[0]);
    assert.equal(slice.content[1], children[1]);
    assert.deepEqual(slice.content, children);
  });

  it('applies a fitted spec with direct slice and closed-fragment parity', () => {
    const previewEditor = createTextEditor();
    const sliceEditor = createTextEditor();
    const fragmentEditor = createTextEditor();
    const slice = ContentSlice.closed([{ text: '!' }]);
    let previewCommits = 0;
    let sliceCommits = 0;
    let fragmentCommits = 0;

    previewEditor.subscribeCommit(() => (previewCommits += 1) - 1);
    sliceEditor.subscribeCommit(() => (sliceCommits += 1) - 1);
    fragmentEditor.subscribeCommit(() => (fragmentCommits += 1) - 1);

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

    editor.subscribeCommit(() => (commits += 1) - 1);

    const result = editor.read.slice.fit(ContentSlice.closed([{ text: '!' }]), {
      at: [99],
    });

    assert.equal(result, false);
    assert.equal(commits, 0);
    assert.deepEqual(editor.read.runtime.snapshot(), before);
  });
});
