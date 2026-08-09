import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineExtension,
  type EditorCommit,
} from '@platejs/plite';

describe('extension portal', () => {
  it('applies an update policy to one descriptor-scoped method', () => {
    const WriterExtension = defineExtension('writer', {
      update: ({ tx }) => ({
        append() {
          tx.text.insert('!', { at: { offset: 4, path: [0, 0] } });
        },
      }),
    });
    const editor = createEditor({
      extensions: [WriterExtension],
      initialValue: [{ children: [{ text: 'test' }], type: 'paragraph' }],
    });
    let commit: EditorCommit | undefined;

    editor.subscribeCommit((nextCommit) => {
      commit = nextCommit;
    });

    editor.extension(WriterExtension).update({ tags: 'scoped' }).append();

    assert.equal(editor.read.text.string([]), 'test!');
    assert.deepEqual(commit?.tags, ['scoped']);
  });
});
