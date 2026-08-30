import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, defineExtension, type EditorCommit } from 'plitejs';

describe('extension portal', () => {
  it('applies an update policy to one descriptor-scoped method', () => {
    const WriterExtension = defineExtension('writer', {
      update: ({ tx }) => ({
        nested: {
          append() {
            tx.text.insert('!', { at: { offset: 4, path: [0, 0] } });
          },
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

    editor
      .extension(WriterExtension)
      .update({ tags: 'scoped' })
      .nested.append();

    assert.equal(editor.read.text.string([]), 'test!');
    assert.deepEqual(commit?.tags, ['scoped']);
  });

  it('rejects update method names reserved by JavaScript protocols', () => {
    const ReservedExtension = defineExtension('reservedUpdateMethods', {
      update: () => ({
        nested: {
          then: () => {},
          toJSON: () => {},
        },
      }),
    });
    const editor = createEditor({ extensions: [ReservedExtension] });

    assert.throws(
      () => editor.update(() => {}),
      /method "nested\.(?:then|toJSON)" uses a reserved protocol name/
    );
  });
});
