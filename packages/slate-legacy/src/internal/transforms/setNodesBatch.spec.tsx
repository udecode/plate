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

  it('routes generated operations through apply wrappers', () => {
    const editor = createEditor({
      children: [
        { children: [{ text: 'one' }], type: 'p' },
        { children: [{ text: 'two' }], type: 'p' },
      ] as any,
    });
    const apply = editor.apply as (op: any) => void;
    const seen: any[] = [];

    editor.apply = ((op: any) => {
      seen.push(op);
      apply(op);
    }) as typeof editor.apply;

    editor.tf.setNodesBatch([
      { at: [0], props: { id: 'a' } },
      { at: [1], props: { id: 'b' } },
    ]);

    expect(seen).toEqual([
      {
        type: 'set_node',
        path: [0],
        properties: {},
        newProperties: { id: 'a' },
      },
      {
        type: 'set_node',
        path: [1],
        properties: {},
        newProperties: { id: 'b' },
      },
    ]);
  });

  it('removes properties for null and undefined values', () => {
    const editor = createEditor({
      children: [
        { children: [{ text: 'one' }], id: 'a', optional: true, type: 'p' },
      ] as any,
    });

    editor.tf.setNodesBatch([
      { at: [0], props: { id: null, optional: undefined } as any },
    ]);

    expect(editor.children).toEqual([
      { children: [{ text: 'one' }], type: 'p' },
    ]);
    expect(editor.operations).toEqual([
      {
        type: 'set_node',
        path: [0],
        properties: { id: 'a', optional: true },
        newProperties: {},
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
