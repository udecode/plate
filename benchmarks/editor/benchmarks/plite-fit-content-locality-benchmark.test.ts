import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  defineEditorSchema,
  schema,
} from '../../../packages/plitejs/src/index';

describe('fitContent locality benchmark authority', () => {
  it('exercises the live detached fitting API without publishing', () => {
    const definition = defineEditorSchema(
      'schema:fit-content-locality-authority',
      {
        elements: {
          cell: {
            content: schema.content.type('paragraph', {
              default: { type: 'paragraph' },
              min: 1,
            }),
          },
          paragraph: {
            content: schema.content.text({ default: 'text', min: 1 }),
          },
        },
        id: 'fit-content-locality-authority',
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version: 1,
      }
    );
    const editor = createEditor({
      plugins: [definition],
      initialValue: [{ children: [{ text: 'document' }], type: 'paragraph' }],
    });
    const children = editor.read.children();
    const fitted = editor.read.slice.fitContent(
      ContentSlice.closed([{ text: 'detached' }]),
      {
        parent: {
          children: [{ children: [{ text: '' }], type: 'paragraph' }],
          type: 'cell',
        },
      }
    );

    assert.deepEqual(fitted, [
      { children: [{ text: 'detached' }], type: 'paragraph' },
    ]);
    assert.equal(editor.read.children(), children);
    assert.equal(editor.read.lastCommit(), null);
  });
});
