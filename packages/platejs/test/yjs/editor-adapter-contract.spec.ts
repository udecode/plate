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
import { createYjsTestEditor } from './support/collaboration';

describe('platejs/yjs editor adapter', () => {
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
