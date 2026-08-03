import type { Value } from 'platejs';
import { renderStaticHtml } from 'platejs/static';

import { createStaticEditor } from './create-static-editor';

const representableValue: Value = [
  {
    textAlign: 'right',
    children: [
      { bold: true, text: 'Plate ' },
      {
        children: [{ text: 'link' }],
        target: '_blank',
        type: 'link',
        url: 'https://platejs.org/',
      },
      { text: ' end' },
    ],
    indent: 1,
    lineHeight: 2,
    type: 'paragraph',
  },
  {
    textAlign: 'justify',
    children: [{ text: 'Second paragraph' }],
    indent: 2,
    lineHeight: 3,
    type: 'paragraph',
  },
  {
    children: [
      {
        children: [{ text: 'Quoted paragraph' }],
        type: 'paragraph',
      },
    ],
    type: 'blockquote',
  },
];

describe('core static HTML representable projection', () => {
  it('decodes visible block, property, mark, and link fields', async () => {
    const editor = createStaticEditor(representableValue);

    const html = await renderStaticHtml(editor);

    const nodes = editor.api.html.deserialize({
      collapseWhiteSpace: false,
      element: html,
    });

    expect(nodes).toEqual(representableValue);
  });
});
