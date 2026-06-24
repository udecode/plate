import type { BasePlateEditor } from '../../editor';

import { createBasePlateEditor } from '../../editor';

describe('LengthPlugin', () => {
  let editor: BasePlateEditor;

  const createEditorWithLength = (maxLength: number) =>
    createBasePlateEditor({
      autoSelect: true,
      maxLength,
    });

  const deleteText = (options: Parameters<BasePlateEditor['update']>[0]) => {
    editor.update(options);
  };
  const insertFragment = (fragment: BasePlateEditor['children']) => {
    editor.update((tx) => {
      tx.fragment.insert(fragment);
    });
  };
  const insertText = (text: string) => {
    editor.update((tx) => {
      tx.text.insert(text);
    });
  };

  describe('when inserting text', () => {
    it('allow inserting text within the maxLength', () => {
      editor = createEditorWithLength(10);
      insertText('Hello');

      expect(editor.children).toEqual([
        { children: [{ text: 'Hello' }], type: 'p' },
      ]);
    });

    it('truncate text that exceeds maxLength', () => {
      editor = createEditorWithLength(5);
      insertText('Hello, World!');

      expect(editor.children).toEqual([
        { children: [{ text: 'Hello' }], type: 'p' },
      ]);
    });

    it('handle multiple insertions up to maxLength', () => {
      editor = createEditorWithLength(10);
      insertText('Hello');
      insertText(', ');
      insertText('World');

      expect(editor.children).toEqual([
        { children: [{ text: 'Hello, Wor' }], type: 'p' },
      ]);
    });
  });

  describe('when deleting text', () => {
    it('allow deleting text', () => {
      editor = createEditorWithLength(10);
      insertText('Hello, World');
      deleteText((tx) => {
        tx.text.delete({ distance: 7, reverse: true });
      });

      expect(editor.children).toEqual([
        { children: [{ text: 'Hel' }], type: 'p' },
      ]);
    });
  });

  describe('when pasting text', () => {
    it('truncate pasted text that exceeds maxLength', () => {
      editor = createEditorWithLength(10);
      insertFragment([
        { children: [{ text: 'This is a long pasted text' }], type: 'p' },
      ]);

      expect(editor.children).toEqual([
        { children: [{ text: 'This is a ' }], type: 'p' },
      ]);
    });
  });

  describe('when maxLength is not set', () => {
    it('does not limit text input', () => {
      editor = createBasePlateEditor({
        autoSelect: true,
      });
      insertText('This is a very long text that exceeds any reasonable limit');

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
