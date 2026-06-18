import { createEditor } from '../../create-editor';

describe('setSelection', () => {
  it('updates only the requested selection properties', () => {
    const editor: any = createEditor({
      children: [{ type: 'p', children: [{ text: 'word' }] }] as any,
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
    });
    const selections = [
      {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
    ];

    editor.selections = selections;
    editor.tf.setSelection({
      anchor: { offset: 0, path: [0, 0] },
    });

    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    });
    expect(editor.selections).toBe(selections);
  });

  it('does nothing when the current selection is null', () => {
    const editor: any = createEditor({
      children: [{ type: 'p', children: [{ text: 'word' }] }] as any,
      selection: null,
    });
    const selections = [
      {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
    ];

    editor.selections = selections;
    editor.tf.setSelection({
      anchor: { offset: 0, path: [0, 0] },
    });

    expect(editor.selection).toBeNull();
    expect(editor.selections).toBe(selections);
  });
});
