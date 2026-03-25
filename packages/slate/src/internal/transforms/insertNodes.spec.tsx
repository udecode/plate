import { createEditor } from '../../create-editor';

describe('insertNodes', () => {
  it('removes an empty paragraph before inserting when removeEmpty is true', () => {
    const editor = createEditor({
      children: [
        { type: 'p', children: [{ text: '' }] },
        { type: 'p', children: [{ text: 'after' }] },
      ] as any,
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });

    editor.tf.insertNodes({ type: 'p', children: [{ text: 'new' }] } as any, {
      removeEmpty: true,
    });

    expect(editor.children).toEqual([
      { type: 'p', children: [{ text: 'new' }] },
      { type: 'p', children: [{ text: 'after' }] },
    ]);
  });

  it('keeps the original block when removeEmpty filters it out', () => {
    const editor = createEditor({
      children: [
        { type: 'p', children: [{ text: '' }] },
        { type: 'p', children: [{ text: 'after' }] },
      ] as any,
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });

    editor.tf.insertNodes({ type: 'p', children: [{ text: 'new' }] } as any, {
      removeEmpty: { allow: ['blockquote'] },
    });

    expect(editor.children).toEqual([
      { type: 'p', children: [{ text: '' }] },
      { type: 'p', children: [{ text: 'new' }] },
      { type: 'p', children: [{ text: 'after' }] },
    ]);
  });

  it('inserts after the current block when nextBlock is true', () => {
    const editor = createEditor({
      children: [
        { type: 'p', children: [{ text: 'one' }] },
        { type: 'p', children: [{ text: 'two' }] },
      ] as any,
      selection: {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
    });

    editor.tf.insertNodes({ type: 'p', children: [{ text: 'new' }] } as any, {
      nextBlock: true,
    });

    expect(editor.children).toEqual([
      { type: 'p', children: [{ text: 'one' }] },
      { type: 'p', children: [{ text: 'new' }] },
      { type: 'p', children: [{ text: 'two' }] },
    ]);
  });

  it('inserts at the end when there is no selection or explicit target', () => {
    const editor = createEditor({
      children: [
        { type: 'p', children: [{ text: 'one' }] },
        { type: 'p', children: [{ text: 'two' }] },
      ] as any,
      selection: null,
    });

    editor.tf.insertNodes({ type: 'p', children: [{ text: 'new' }] } as any);

    expect(editor.children).toEqual([
      { type: 'p', children: [{ text: 'one' }] },
      { type: 'p', children: [{ text: 'two' }] },
      { type: 'p', children: [{ text: 'new' }] },
    ]);
  });

  it('prefers an explicit target over the current selection', () => {
    const editor = createEditor({
      children: [
        { type: 'p', children: [{ text: 'one' }] },
        { type: 'p', children: [{ text: 'two' }] },
      ] as any,
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
    });

    editor.tf.insertNodes({ type: 'p', children: [{ text: 'new' }] } as any, {
      at: [1],
    });

    expect(editor.children).toEqual([
      { type: 'p', children: [{ text: 'one' }] },
      { type: 'p', children: [{ text: 'new' }] },
      { type: 'p', children: [{ text: 'two' }] },
    ]);
  });
});
