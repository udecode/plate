import { renderStaticHtml } from 'platejs/static';

import { createStaticEditor } from './create-static-editor';

describe('core static renderStaticHtml mark rendering', () => {
  it('renders bold text', async () => {
    const editor = createStaticEditor([
      {
        children: [
          { text: 'Some paragraph of text with ' },
          { bold: true, text: 'bold' },
          { text: ' part.' },
        ],
        type: 'paragraph',
      },
    ]);

    const html = await renderStaticHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toContain(
      '<span data-plite-leaf="true"><strong><span data-plite-string="true">bold</span></strong></span>'
    );
  });

  it('renders italic text', async () => {
    const editor = createStaticEditor([
      {
        children: [
          { text: 'Some paragraph of text with ' },
          { italic: true, text: 'italic' },
          { text: ' part.' },
        ],
        type: 'paragraph',
      },
    ]);

    const html = await renderStaticHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toContain(
      '<span data-plite-leaf="true"><em><span data-plite-string="true">italic</span></em></span>'
    );
  });

  it('renders underlined text', async () => {
    const editor = createStaticEditor([
      {
        children: [
          { text: 'Some paragraph of text with ' },
          { text: 'underlined', underline: true },
          { text: ' part.' },
        ],
        type: 'paragraph',
      },
    ]);

    const html = await renderStaticHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toContain(
      '<span data-plite-leaf="true"><u><span data-plite-string="true">underlined</span></u></span>'
    );
  });

  it('renders strikethrough text', async () => {
    const editor = createStaticEditor([
      {
        children: [
          { text: 'Some paragraph of text with ' },
          { strikethrough: true, text: 'strikethrough' },
          { text: ' part.' },
        ],
        type: 'paragraph',
      },
    ]);

    const html = await renderStaticHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toContain(
      '<span data-plite-leaf="true"><s><span data-plite-string="true">strikethrough</span></s></span>'
    );
  });

  it('renders code text', async () => {
    const editor = createStaticEditor([
      {
        children: [
          { text: 'Some paragraph of text with ' },
          { code: true, text: 'some code' },
          { text: ' part.' },
        ],
        type: 'paragraph',
      },
    ]);

    const html = await renderStaticHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toContain(
      '<span data-plite-leaf="true"><code><span data-plite-string="true">some code</span></code></span>'
    );
  });

  it('renders subscript text', async () => {
    const editor = createStaticEditor([
      {
        children: [
          { text: 'Some paragraph of text with ' },
          { script: 'sub', text: 'subscripted' },
          { text: ' part.' },
        ],
        type: 'paragraph',
      },
    ]);

    const html = await renderStaticHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toContain(
      '<span data-plite-leaf="true"><sub><span data-plite-string="true">subscripted</span></sub></span>'
    );
  });

  it('renders superscript text', async () => {
    const editor = createStaticEditor([
      {
        children: [
          { text: 'Some paragraph of text with ' },
          { script: 'sup', text: 'superscripted' },
          { text: ' part.' },
        ],
        type: 'paragraph',
      },
    ]);

    const html = await renderStaticHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toContain(
      '<span data-plite-leaf="true"><sup><span data-plite-string="true">superscripted</span></sup></span>'
    );
  });

  it('renders keyboard text', async () => {
    const editor = createStaticEditor([
      {
        children: [
          { text: 'Some paragraph of text with ' },
          { kbd: true, text: 'keyboard shortcut' },
          { text: ' part.' },
        ],
        type: 'paragraph',
      },
    ]);

    const html = await renderStaticHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toContain(
      '<span data-plite-leaf="true"><kbd><span data-plite-string="true">keyboard shortcut</span></kbd></span>'
    );
  });

  it('renders multiple marks on the same leaf', async () => {
    const editor = createStaticEditor([
      {
        children: [
          { text: 'Some paragraph of text with ' },
          { bold: true, italic: true, text: 'bold and italic' },
          { text: ' part.' },
        ],
        type: 'paragraph',
      },
    ]);

    const html = await renderStaticHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toContain(
      '<span data-plite-leaf="true"><em><strong><span data-plite-string="true">bold and italic</span></strong></em></span>'
    );
  });
});
