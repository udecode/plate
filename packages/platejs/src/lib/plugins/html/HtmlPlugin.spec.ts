import { BaseImagePlugin } from '../../../features/media/lib/image/BaseImagePlugin';
import { createEditor } from '../../editor';
import { HtmlPlugin } from './HtmlPlugin';

describe('HtmlPlugin', () => {
  it('publishes the HTML API without a public parser descriptor', () => {
    const editor = createEditor();

    expect(editor.api.html).toBe(editor.plugin(HtmlPlugin).api);
    expect(Object.isFrozen(editor.api.html)).toBe(true);
    expect('parser' in editor.plugin(HtmlPlugin)).toBe(false);
  });

  it('deserializes the document body through one exact-slice mapping', () => {
    const editor = createEditor();
    const transfer = new DataTransfer();

    transfer.setData('text/html', '<p>Hello</p>');

    expect(editor.api.dom.clipboard.insertData(transfer)).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'Hello' }], type: 'paragraph' },
    ]);
  });

  it('delegates HTML with nothing insertable to the next format', () => {
    const editor = createEditor();
    const transfer = new DataTransfer();

    transfer.setData('text/html', '<video src="https://x.test/a.mp4"></video>');

    expect(editor.api.dom.clipboard.insertData(transfer)).toBe(false);

    transfer.setData('text/plain', 'Caption');

    expect(editor.api.dom.clipboard.insertData(transfer)).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'Caption' }], type: 'paragraph' },
    ]);
  });

  it('lifts block images out of HTML text blocks without dropping them', () => {
    const editor = createEditor({ plugins: [BaseImagePlugin] });
    const html = '<p>Keep <img src="https://example.com/a.png">more</p>';
    const expected = [
      { children: [{ text: 'Keep ' }], type: 'paragraph' },
      { type: 'image', url: 'https://example.com/a.png' },
      { children: [{ text: 'more' }], type: 'paragraph' },
    ];

    expect(editor.api.html.parseSlice(html)).toMatchObject({
      ok: true,
      slice: { content: expected },
    });

    const transfer = new DataTransfer();

    transfer.setData('text/html', html);

    expect(editor.api.dom.clipboard.insertData(transfer)).toBe(true);
    expect(editor.read.children()).toMatchObject(expected);
  });

  it('serializes one complete document and reports unrepresented data', () => {
    const editor = createEditor({
      initialValue: {
        children: [{ children: [{ text: 'Hello' }], type: 'paragraph' }],
        meta: { revision: 4 },
      },
    });
    const result = editor.api.html.serialize();

    expect(result.data).toBe('<p>Hello</p>');
    expect(result.diagnostics.map(({ code }) => code)).toEqual([
      'html-unsupported-metadata',
    ]);
    const parsed = editor.api.html.parse(result.data);

    if (!parsed.ok) throw new Error(parsed.diagnostics[0].message);

    expect(parsed.document).toEqual({
      children: [{ children: [{ text: 'Hello' }], type: 'paragraph' }],
    });
  });
});
