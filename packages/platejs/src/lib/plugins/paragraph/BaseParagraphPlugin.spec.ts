import { ContentSlice } from 'plitejs';
import { writeHostFragmentData } from 'plitejs/dom';

import { createEditor } from '../../editor';
import { BaseParagraphPlugin } from './BaseParagraphPlugin';

describe('BaseParagraphPlugin', () => {
  it('decodes and encodes its HTML element claim', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin],
    });
    const fragment = editor.api.html.deserialize({
      element: '<p>Paragraph</p>',
    });
    const data = new DataTransfer();

    expect(fragment).toEqual([
      {
        children: [{ text: 'Paragraph' }],
        type: 'paragraph',
      },
    ]);
    expect(
      writeHostFragmentData(editor, data, ContentSlice.closed(fragment!))
    ).toContain('text/html');
    expect(data.getData('text/html')).toBe('<p>Paragraph</p>');
  });
});
