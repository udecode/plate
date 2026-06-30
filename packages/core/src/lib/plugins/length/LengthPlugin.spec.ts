import type { BaseEditor } from '../../editor';

import { createBaseEditor } from '../../editor';

describe('LengthPlugin', () => {
  let editor: BaseEditor;

  const createEditorWithLength = (maxLength: number) =>
    createBaseEditor({
      autoSelect: true,
      maxLength,
    });

  describe('when inserting text', () => {
    it('allow inserting text within the maxLength', () => {
      editor = createEditorWithLength(10);
      editor.update.text.insert('Hello');

      expect(editor.read.children()).toEqual([
        { children: [{ text: 'Hello' }], type: 'p' },
      ]);
    });

    it('truncate text that exceeds maxLength', () => {
      editor = createEditorWithLength(5);
      editor.update.text.insert('Hello, World!');

      expect(editor.read.children()).toEqual([
        { children: [{ text: 'Hello' }], type: 'p' },
      ]);
    });

    it('handle multiple insertions up to maxLength', () => {
      editor = createEditorWithLength(10);
      editor.update.text.insert('Hello');
      editor.update.text.insert(', ');
      editor.update.text.insert('World');

      expect(editor.read.children()).toEqual([
        { children: [{ text: 'Hello, Wor' }], type: 'p' },
      ]);
    });
  });

  describe('when deleting text', () => {
    it('allow deleting text', () => {
      editor = createEditorWithLength(10);
      editor.update.text.insert('Hello, World');
      editor.update((tx) => {
        tx.text.delete({ distance: 7, reverse: true });
      });

      expect(editor.read.children()).toEqual([
        { children: [{ text: 'Hel' }], type: 'p' },
      ]);
    });
  });

  describe('when pasting text', () => {
    it('truncate pasted text that exceeds maxLength', () => {
      editor = createEditorWithLength(10);
      editor.update.fragment.insert([
        { children: [{ text: 'This is a long pasted text' }], type: 'p' },
      ]);

      expect(editor.read.children()).toEqual([
        { children: [{ text: 'This is a ' }], type: 'p' },
      ]);
    });
  });

  describe('when maxLength is not set', () => {
    it('does not limit text input', () => {
      editor = createBaseEditor({
        autoSelect: true,
      });
      editor.update.text.insert(
        'This is a very long text that exceeds any reasonable limit'
      );

      expect(editor.read.children()).toEqual([
        {
          children: [
            {
              text: 'This is a very long text that exceeds any reasonable limit',
            },
          ],
          type: 'p',
        },
      ]);
    });
  });

  describe('plugin options', () => {
    it('correctly set maxLength option', () => {
      editor = createEditorWithLength(15);
      const options = editor.plugins.length.options;

      expect(options.maxLength).toBe(15);
    });
  });
});
