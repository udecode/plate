/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsx;

describe('setNodesBatch', () => {
  it('applies multiple exact-path updates and records ordinary set_node ops', () => {
    const editor = createEditor({
      children: [
        { children: [{ text: 'one' }], type: 'p' },
        { children: [{ text: 'two' }], type: 'p' },
        { children: [{ text: 'three' }], type: 'p' },
      ] as any,
    });

    editor.tf.setNodesBatch([
      { at: [0], props: { id: 'a' } },
      { at: [2], props: { id: 'c' } },
    ]);

    expect(editor.children).toEqual([
      { children: [{ text: 'one' }], id: 'a', type: 'p' },
      { children: [{ text: 'two' }], type: 'p' },
      { children: [{ text: 'three' }], id: 'c', type: 'p' },
    ]);
    expect(editor.operations).toEqual([
      {
        type: 'set_node',
        path: [0],
        properties: {},
        newProperties: { id: 'a' },
      },
      {
        type: 'set_node',
        path: [2],
        properties: {},
        newProperties: { id: 'c' },
      },
    ]);
  });

  it('rejects duplicate exact paths in one batch', () => {
    const editor = createEditor({
      children: [{ children: [{ text: 'one' }], type: 'p' }] as any,
    });

    expect(() =>
      editor.tf.setNodesBatch([
        { at: [0], props: { id: 'a' } },
        { at: [0], props: { id: 'b' } },
      ])
    ).toThrow(/duplicate update paths/i);
  });
});
