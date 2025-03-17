import { createEditor } from '../../create-editor';

describe('reset', () => {
  it('should reset editor state', () => {
    const editor = createEditor();

    // Set up initial state
    editor.children = [{ children: [{ text: 'test' }], type: 'p' }];
    editor.operations = [
      { offset: 0, path: [0, 0], text: 'test', type: 'insert_text' },
    ];
    editor.marks = { bold: true };
    editor.history = {
      redos: [{ operations: [] } as any],
      undos: [{ operations: [] } as any],
    };

    // Reset editor
    editor.tf.reset();

    // Verify state is reset
    expect(editor.children).toEqual([{ children: [{ text: '' }], type: 'p' }]);
    expect(editor.operations).toEqual([]);
    expect(editor.marks).toBeNull();
    expect(editor.history.undos).toEqual([]);
    expect(editor.history.redos).toEqual([]);
  });

  it('should only reset children when children option is true', () => {
    const editor = createEditor();

    // Set up initial state
    editor.children = [{ children: [{ text: 'test' }], type: 'p' }];
    editor.operations = [
      { offset: 0, path: [0, 0], text: 'test', type: 'insert_text' },
    ];
    editor.marks = { bold: true };
    editor.history = {
      redos: [{ operations: [] } as any],
      undos: [{ operations: [] } as any],
    };

    // Reset only children
    editor.tf.reset({ children: true });

    // Verify only children are reset
    expect(editor.children).toEqual([{ children: [{ text: '' }], type: 'p' }]);
    expect(editor.operations.length).toBeGreaterThan(0);
    expect(editor.marks).toEqual({ bold: true });
    expect(editor.history.undos).toEqual([{ operations: [] }]);
    expect(editor.history.redos).toEqual([{ operations: [] }]);
  });
});
