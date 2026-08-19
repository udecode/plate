import { decode } from 'html-entities';
import { renderStaticHtml } from 'platejs/static';

import { createStaticEditor } from './create-static-editor';

describe('core static renderStaticHtml element rendering', () => {
  it('renders paragraph text', async () => {
    const editor = createStaticEditor([
      {
        children: [{ text: 'Some random paragraph here...' }],
        type: 'paragraph',
      },
    ]);

    const html = await renderStaticHtml(editor);

    expect(html).toContain('Some random paragraph here...');
  });

  it('renders heading nodes', async () => {
    const editor = createStaticEditor([
      {
        children: [{ text: 'Heading 1' }],
        level: 1,
        type: 'heading',
      },
      {
        children: [{ text: 'Heading 2' }],
        level: 2,
        type: 'heading',
      },
      {
        children: [{ text: 'Heading 3' }],
        level: 3,
        type: 'heading',
      },
    ]);

    const html = await renderStaticHtml(editor);

    expect(html).toContain('Heading 1');
    expect(html).toContain('Heading 2');
    expect(html).toContain('Heading 3');
  });

  it('renders blockquote text', async () => {
    const editor = createStaticEditor([
      {
        children: [{ text: 'Blockquoted text here...' }],
        type: 'blockquote',
      },
    ]);

    const html = await renderStaticHtml(editor);

    expect(html).toContain('Blockquoted text here...');
  });

  it('renders link hrefs', async () => {
    const editor = createStaticEditor([
      {
        children: [{ text: 'Some paragraph of text with ' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'link' }],
        type: 'link',
        url: 'https://example.com/',
      },
      { children: [{ text: ' part.' }], type: 'paragraph' },
    ]);

    const html = await renderStaticHtml(editor);

    expect(html).toContain(decode('href="https://example.com/"'));
    expect(html).toContain('plite-link');
  });

  it('renders image src attributes', async () => {
    const editor = createStaticEditor([
      {
        children: [{ text: '' }],
        type: 'image',
        url: 'https://example.com/image.jpg',
      },
    ]);

    const html = await renderStaticHtml(editor);

    expect(html).toContain('src="https://example.com/image.jpg"');
  });

  it('renders table cell content', async () => {
    const editor = createStaticEditor([
      {
        children: [
          {
            children: [
              { children: [{ text: 'Cell 1' }], type: 'tableCell' },
              { children: [{ text: 'Cell 2' }], type: 'tableCell' },
            ],
            type: 'tableRow',
          },
        ],
        type: 'table',
      },
    ]);

    const html = await renderStaticHtml(editor);

    expect(html).toContain('Cell 1');
    expect(html).toContain('Cell 2');
  });
});
