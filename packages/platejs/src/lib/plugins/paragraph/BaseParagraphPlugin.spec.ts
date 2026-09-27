import { ContentSlice } from '../../../core';
import { writeDataTransferFragment } from '../../../dom';
import { parseHtmlSliceContent } from '../../../internal/testing/parseHtmlSliceContent';
import { createEditor } from '../../editor';
import { BaseParagraphPlugin } from './BaseParagraphPlugin';

describe('BaseParagraphPlugin', () => {
  it('decodes and encodes its HTML element claim', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin],
    });
    const fragment = parseHtmlSliceContent(editor, '<p>Paragraph</p>');
    const data = new DataTransfer();

    expect(fragment).toEqual([
      {
        children: [{ text: 'Paragraph' }],
        type: 'paragraph',
      },
    ]);
    expect(
      writeDataTransferFragment(editor, data, ContentSlice.closed(fragment!))
    ).toContain('text/html');
    expect(data.getData('text/html')).toBe('<p>Paragraph</p>');
  });
});
