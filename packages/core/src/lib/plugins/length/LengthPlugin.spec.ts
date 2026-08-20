import { MarkdownPlugin } from '@platejs/markdown';

import type { SlateEditor } from '../../editor';

import { createPlateEditor } from '../../../react';
import { createSlateEditor } from '../../editor';

describe('LengthPlugin', () => {
  let editor: SlateEditor;

  const createEditorWithLength = (maxLength: number) =>
    createSlateEditor({
      autoSelect: true,
      maxLength,
    });

  describe('when inserting text', () => {
    it('allow inserting text within the maxLength', () => {
      editor = createEditorWithLength(10);
      editor.tf.insertText('Hello');

      expect(editor.children).toEqual([
        { children: [{ text: 'Hello' }], type: 'p' },
      ]);
    });

    it('truncate text that exceeds maxLength', () => {
      editor = createEditorWithLength(5);
      editor.tf.insertText('Hello, World!');

      expect(editor.children).toEqual([
        { children: [{ text: 'Hello' }], type: 'p' },
      ]);
    });

    it('handle multiple insertions up to maxLength', () => {
      editor = createEditorWithLength(10);
      editor.tf.insertText('Hello');
      editor.tf.insertText(', ');
      editor.tf.insertText('World');

      expect(editor.children).toEqual([
        { children: [{ text: 'Hello, Wor' }], type: 'p' },
      ]);
    });
  });

  describe('when deleting text', () => {
    it('allow deleting text', () => {
      editor = createEditorWithLength(10);
      editor.tf.insertText('Hello, World');
      editor.tf.delete({ distance: 7, reverse: true });

      expect(editor.children).toEqual([
        { children: [{ text: 'Hel' }], type: 'p' },
      ]);
    });
  });

  describe('when pasting text', () => {
    it('truncates multiline plain text without crashing', () => {
      const editor = createPlateEditor({
        autoSelect: true,
        maxLength: 20,
        plugins: [MarkdownPlugin],
      });
      const dataTransfer = {
        getData: (format: string) =>
          format === 'text/plain'
            ? '123456789012345678901\n\ntrailing text'
            : '',
      } as DataTransfer;

      expect(() => editor.tf.insertData(dataTransfer)).not.toThrow();
      expect(editor.api.string([])).toHaveLength(20);
    });

    it('truncate pasted text that exceeds maxLength', () => {
      editor = createEditorWithLength(10);
      editor.tf.insertFragment([
        { children: [{ text: 'This is a long pasted text' }], type: 'p' },
      ]);

      expect(editor.children).toEqual([
        { children: [{ text: 'This is a ' }], type: 'p' },
      ]);
    });

    it('enforces maxLength across empty fragment blocks', () => {
      editor = createEditorWithLength(20);
      editor.tf.insertFragment([
        { children: [{ text: '123456789012345678901' }], type: 'p' },
        { children: [{ text: '' }], type: 'p' },
        { children: [{ text: '' }], type: 'p' },
        { children: [{ text: 'trailing text' }], type: 'p' },
      ]);

      expect(editor.children).toEqual([
        { children: [{ text: '12345678901234567890' }], type: 'p' },
      ]);
    });
  });

  describe('when maxLength is not set', () => {
    it('does not limit text input', () => {
      editor = createSlateEditor({
        autoSelect: true,
      });
      editor.tf.insertText(
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
    it('correctly set maxLength option', () => {
      editor = createEditorWithLength(15);
      const options = editor.plugins.length.options;

      expect(options.maxLength).toBe(15);
    });
  });
});
