import { createEditor } from '../../create-editor';

describe('setPoint', () => {
  it('updates the anchor point on the current selection', () => {
    const editor = createEditor({
      children: [{ type: 'p', children: [{ text: 'test' }] }] as any,
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
    });

    editor.tf.setPoint({ offset: 2 }, { edge: 'anchor' });

    expect(editor.selection).toEqual({
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    });
  });
});
