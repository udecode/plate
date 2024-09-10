import type { SlateEditor } from '../../editor';

import { createPlateEditor } from '../../../react';

describe('LengthPlugin', () => {
  let editor: SlateEditor;

  const createEditorWithLength = (maxLength: number) => {
    return createPlateEditor({
      autoSelect: true,
      maxLength,
    });
  };

  describe('when inserting text', () => {
    it('should allow inserting text within the maxLength', () => {
      editor = createEditorWithLength(10);
      editor.insertText('Hello');

      expect(editor.children).toEqual([
        { children: [{ text: 'Hello' }], type: 'p' },
      ]);
    });

    it('should truncate text that exceeds maxLength', () => {
      editor = createEditorWithLength(5);
      editor.insertText('Hello, World!');

      expect(editor.children).toEqual([
        { children: [{ text: 'Hello' }], type: 'p' },
      ]);
    });

    it('should handle multiple insertions up to maxLength', () => {
      editor = createEditorWithLength(10);
      editor.insertText('Hello');
      editor.insertText(', ');
      editor.insertText('World');

      expect(editor.children).toEqual([
        { children: [{ text: 'Hello, Wor' }], type: 'p' },
      ]);
    });
  });

  describe('when deleting text', () => {
    it('should allow deleting text', () => {
      editor = createEditorWithLength(10);
      editor.insertText('Hello, World');
      editor.delete({ distance: 7, reverse: true });

      expect(editor.children).toEqual([
        { children: [{ text: 'Hel' }], type: 'p' },
      ]);
    });
  });

  describe('when pasting text', () => {
    it('should truncate pasted text that exceeds maxLength', () => {
      editor = createEditorWithLength(10);
      editor.insertFragment([
        { children: [{ text: 'This is a long pasted text' }], type: 'p' },
      ]);

      expect(editor.children).toEqual([
        { children: [{ text: 'This is a ' }], type: 'p' },
      ]);
    });
  });

  describe('when maxLength is not set', () => {
    it('should not limit text input', () => {
      editor = createPlateEditor({
        autoSelect: true,
      });
      editor.insertText(
        'This is a very long text that exceeds any reasonable limit'
      );

      expect(editor.children).toEqual([
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
    it('should correctly set maxLength option', () => {
      editor = createEditorWithLength(15);
      const options = editor.plugins.length.options;

      expect(options.maxLength).toBe(15);
    });
  });
});
