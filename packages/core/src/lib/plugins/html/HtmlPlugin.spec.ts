import { createBaseEditor } from '../../editor';
import { HtmlPlugin } from './HtmlPlugin';

describe('HtmlPlugin', () => {
  it('publishes the HTML API without a public parser descriptor', () => {
    const editor = createBaseEditor();

    expect(editor.api.html).toBe(editor.plugin(HtmlPlugin).api);
    expect(Object.isFrozen(editor.api.html)).toBe(true);
    expect('parser' in editor.plugin(HtmlPlugin)).toBe(false);
  });

  it('deserializes the document body through one exact-slice codec', () => {
    const editor = createBaseEditor();
    const transfer = new DataTransfer();

    transfer.setData('text/html', '<p>Hello</p>');

    expect(editor.api.dom.clipboard.insertData(transfer)).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'Hello' }], type: 'paragraph' },
    ]);
  });
});
