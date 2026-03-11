import { createEditor } from '../../create-editor';

describe('insertNode', () => {
  it('inserts a node through the legacy editor method', () => {
    const editor: any = createEditor({
      children: [{ type: 'p', children: [{ text: 'one' }] }] as any,
      selection: {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
    });

    editor.insertNode({ type: 'p', children: [{ text: 'two' }] } as any, {
      at: [1],
    });

    expect(editor.children).toEqual([
      { type: 'p', children: [{ text: 'one' }] },
      { type: 'p', children: [{ text: 'two' }] },
    ]);
  });
});
