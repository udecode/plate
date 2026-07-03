import { createBaseEditor } from '../../editor';
import { getEditorPlugin } from '../../plugin';
import { HtmlPlugin } from './HtmlPlugin';

describe('HtmlPlugin', () => {
  it('declares the html parser format', () => {
    const editor = createBaseEditor();

    expect(editor.getPlugin(HtmlPlugin).parser.format).toBe('text/html');
  });

  it('deserializes the parsed document body', () => {
    const editor = createBaseEditor();

    const result = editor.getPlugin(HtmlPlugin).parser.deserialize?.({
      ...getEditorPlugin(editor, HtmlPlugin),
      data: '<p>Hello</p>',
      dataTransfer: new DataTransfer(),
      mimeType: 'text/html',
    });

    expect(result).toEqual([{ children: [{ text: 'Hello' }], type: 'p' }]);
  });
});
