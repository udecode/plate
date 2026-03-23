import { decode } from 'html-entities';
import { serializeHtml } from 'platejs/static';

import { createStaticEditor } from './create-static-editor';

describe('core static serializeHtml element rendering', () => {
  it('renders paragraph text', async () => {
    const editor = createStaticEditor([
      {
        children: [{ text: 'Some random paragraph here...' }],
        type: 'p',
      },
    ]);

    const html = await serializeHtml(editor);

    expect(html).toContain('Some random paragraph here...');
  });

  it('renders heading nodes', async () => {
    const editor = createStaticEditor([
      {
        children: [{ text: 'Heading 1' }],
        type: 'h1',
      },
      {
        children: [{ text: 'Heading 2' }],
        type: 'h2',
      },
      {
        children: [{ text: 'Heading 3' }],
        type: 'h3',
      },
    ]);

    const html = await serializeHtml(editor);

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

    const html = await serializeHtml(editor);

    expect(html).toContain('Blockquoted text here...');
  });

  it('renders link hrefs', async () => {
    const editor = createStaticEditor([
      { children: [{ text: 'Some paragraph of text with ' }], type: 'p' },
      {
        children: [{ text: 'link' }],
        type: 'a',
        url: 'https://example.com/',
      },
      { children: [{ text: ' part.' }], type: 'p' },
    ]);

    const html = await serializeHtml(editor);

    expect(html).toContain(decode('href="https://example.com/"'));
    expect(html).toContain('slate-a');
  });

  it('renders image src attributes', async () => {
    const editor = createStaticEditor([
      {
        children: [{ text: '' }],
        type: 'img',
        url: 'https://example.com/image.jpg',
      },
    ]);

    const html = await serializeHtml(editor);

    expect(html).toContain('src="https://example.com/image.jpg"');
  });

  it('renders table cell content', async () => {
    const editor = createStaticEditor([
      {
        children: [
          {
            children: [
              { children: [{ text: 'Cell 1' }], type: 'td' },
              { children: [{ text: 'Cell 2' }], type: 'td' },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
      },
    ]);

    const html = await serializeHtml(editor);

    expect(html).toContain('Cell 1');
    expect(html).toContain('Cell 2');
  });
});
