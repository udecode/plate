import { createEditor } from 'platejs';

import { BaseEditorKit } from '@/registry/components/editor/plugins-static';

import { renderStaticMarkup } from './render-static-markup';

describe('core static renderStaticHtml mark rendering', () => {
  it('renders bold text', async () => {
    const editor = createEditor({
      plugins: BaseEditorKit,
      initialValue: [
        {
          children: [
            { text: 'Some paragraph of text with ' },
            { bold: true, text: 'bold' },
            { text: ' part.' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const html = await renderStaticMarkup(editor);

    expect(html).toContain('<span><strong><span>bold</span></strong></span>');
  });

  it('renders italic text', async () => {
    const editor = createEditor({
      plugins: BaseEditorKit,
      initialValue: [
        {
          children: [
            { text: 'Some paragraph of text with ' },
            { italic: true, text: 'italic' },
            { text: ' part.' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const html = await renderStaticMarkup(editor);

    expect(html).toContain('<span><em><span>italic</span></em></span>');
  });

  it('renders underlined text', async () => {
    const editor = createEditor({
      plugins: BaseEditorKit,
      initialValue: [
        {
          children: [
            { text: 'Some paragraph of text with ' },
            { text: 'underlined', underline: true },
            { text: ' part.' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const html = await renderStaticMarkup(editor);

    expect(html).toContain('<span><u><span>underlined</span></u></span>');
  });

  it('renders strikethrough text', async () => {
    const editor = createEditor({
      plugins: BaseEditorKit,
      initialValue: [
        {
          children: [
            { text: 'Some paragraph of text with ' },
            { strikethrough: true, text: 'strikethrough' },
            { text: ' part.' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const html = await renderStaticMarkup(editor);

    expect(html).toContain('<span><s><span>strikethrough</span></s></span>');
  });

  it('renders code text', async () => {
    const editor = createEditor({
      plugins: BaseEditorKit,
      initialValue: [
        {
          children: [
            { text: 'Some paragraph of text with ' },
            { code: true, text: 'some code' },
            { text: ' part.' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const html = await renderStaticMarkup(editor);

    expect(html).toContain('<span><code><span>some code</span></code></span>');
  });

  it('renders subscript text', async () => {
    const editor = createEditor({
      plugins: BaseEditorKit,
      initialValue: [
        {
          children: [
            { text: 'Some paragraph of text with ' },
            { script: 'sub', text: 'subscripted' },
            { text: ' part.' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const html = await renderStaticMarkup(editor);

    expect(html).toContain('<span><sub><span>subscripted</span></sub></span>');
  });

  it('renders superscript text', async () => {
    const editor = createEditor({
      plugins: BaseEditorKit,
      initialValue: [
        {
          children: [
            { text: 'Some paragraph of text with ' },
            { script: 'sup', text: 'superscripted' },
            { text: ' part.' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const html = await renderStaticMarkup(editor);

    expect(html).toContain(
      '<span><sup><span>superscripted</span></sup></span>'
    );
  });

  it('renders keyboard text', async () => {
    const editor = createEditor({
      plugins: BaseEditorKit,
      initialValue: [
        {
          children: [
            { text: 'Some paragraph of text with ' },
            { kbd: true, text: 'keyboard shortcut' },
            { text: ' part.' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const html = await renderStaticMarkup(editor);

    expect(html).toContain(
      '<span><kbd><span>keyboard shortcut</span></kbd></span>'
    );
  });

  it('renders multiple marks on the same leaf', async () => {
    const editor = createEditor({
      plugins: BaseEditorKit,
      initialValue: [
        {
          children: [
            { text: 'Some paragraph of text with ' },
            { bold: true, italic: true, text: 'bold and italic' },
            { text: ' part.' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const html = await renderStaticMarkup(editor);

    expect(html).toContain(
      '<span><em><strong><span>bold and italic</span></strong></em></span>'
    );
  });

  it('draws pasted black text in its color', async () => {
    const parsed = createEditor({ plugins: BaseEditorKit }).api.html.parse(
      '<p><span style="color: black">dark</span></p>'
    );

    if (!parsed.ok) throw new Error(parsed.diagnostics[0]?.message);

    const editor = createEditor({
      initialValue: parsed.document.children,
      plugins: BaseEditorKit,
    });

    expect(await renderStaticMarkup(editor)).toMatch(
      /<span style="color: ?black;?">.*dark/
    );
  });
});
