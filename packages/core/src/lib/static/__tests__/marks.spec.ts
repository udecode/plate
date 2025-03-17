import { serializeHtml } from '../serializeHtml';
import { components, createStaticEditor } from './create-static-editor';

describe('serializePlateStatic marks', () => {
  it('should serialize bold to html', async () => {
    const editor = createStaticEditor([
      {
        children: [
          { text: 'Some paragraph of text with ' },
          { bold: true, text: 'bold' },
          { text: ' part.' },
        ],
        type: 'p',
      },
    ]);

    const html = await serializeHtml(editor, {
      components: components,
      preserveClassNames: [],
      stripClassNames: true,
      stripDataAttributes: true,
    });

    expect(html).toContain(
      '<strong data-slate-bold="true"><span>bold</span></strong>'
    );
  });

  it('should serialize italic to html', async () => {
    const editor = createStaticEditor([
      {
        children: [
          { text: 'Some paragraph of text with ' },
          { italic: true, text: 'italic' },
          { text: ' part.' },
        ],
        type: 'p',
      },
    ]);

    const html = await serializeHtml(editor, {
      components: components,
      preserveClassNames: [],
      stripClassNames: true,
      stripDataAttributes: true,
    });
    expect(html).toContain(
      '<em data-slate-italic="true"><span>italic</span></em>'
    );
  });

  it('should serialize underline to html', async () => {
    const editor = createStaticEditor([
      {
        children: [
          { text: 'Some paragraph of text with ' },
          { text: 'underlined', underline: true },
          { text: ' part.' },
        ],
        type: 'p',
      },
    ]);

    const html = await serializeHtml(editor, {
      components: components,
      preserveClassNames: [],
      stripClassNames: true,
      stripDataAttributes: true,
    });
    expect(html).toContain(
      '<u data-slate-underline="true"><span>underlined</span></u>'
    );
  });

  it('should serialize strikethrough to html', async () => {
    const editor = createStaticEditor([
      {
        children: [
          { text: 'Some paragraph of text with ' },
          { strikethrough: true, text: 'strikethrough' },
          { text: ' part.' },
        ],
        type: 'p',
      },
    ]);

    const html = await serializeHtml(editor, {
      components: components,
      preserveClassNames: [],
      stripClassNames: true,
      stripDataAttributes: true,
    });
    expect(html).toContain(
      '<del data-slate-strikethrough="true"><span>strikethrough</span></del>'
    );
  });

  it('should serialize code to html', async () => {
    const editor = createStaticEditor([
      {
        children: [
          { text: 'Some paragraph of text with ' },
          { code: true, text: 'some code' },
          { text: ' part.' },
        ],
        type: 'p',
      },
    ]);

    const html = await serializeHtml(editor, {
      components: components,
      preserveClassNames: [],
      stripClassNames: true,
      stripDataAttributes: true,
    });
    expect(html).toContain(
      '<code data-slate-code="true"><span>some code</span></code>'
    );
  });

  it('should serialize subscript to html', async () => {
    const editor = createStaticEditor([
      {
        children: [
          { text: 'Some paragraph of text with ' },
          { subscript: true, text: 'subscripted' },
          { text: ' part.' },
        ],
        type: 'p',
      },
    ]);

    const html = await serializeHtml(editor, {
      components: components,
      preserveClassNames: [],
      stripClassNames: true,
      stripDataAttributes: true,
    });
    expect(html).toContain(
      '<sub data-slate-subscript="true"><span>subscripted</span></sub>'
    );
  });

  it('should serialize superscript to html', async () => {
    const editor = createStaticEditor([
      {
        children: [
          { text: 'Some paragraph of text with ' },
          { superscript: true, text: 'superscripted' },
          { text: ' part.' },
        ],
        type: 'p',
      },
    ]);

    const html = await serializeHtml(editor, {
      components: components,
      preserveClassNames: [],
      stripClassNames: true,
      stripDataAttributes: true,
    });
    expect(html).toContain(
      '<sup data-slate-superscript="true"><span>superscripted</span></sup>'
    );
  });

  it('should serialize kbd to html', async () => {
    const editor = createStaticEditor([
      {
        children: [
          { text: 'Some paragraph of text with ' },
          { kbd: true, text: 'keyboard shortcut' },
          { text: ' part.' },
        ],
        type: 'p',
      },
    ]);

    const html = await serializeHtml(editor, {
      components: components,
      preserveClassNames: [],
      stripClassNames: true,
      stripDataAttributes: true,
    });
    expect(html).toContain(
      '<kbd data-slate-kbd="true"><span>keyboard shortcut</span></kbd>'
    );
  });

  it('should serialize multiple marks together to html', async () => {
    const editor = createStaticEditor([
      {
        children: [
          { text: 'Some paragraph of text with ' },
          { bold: true, italic: true, text: 'bold and italic' },
          { text: ' part.' },
        ],
        type: 'p',
      },
    ]);

    const html = await serializeHtml(editor, {
      components: components,
      preserveClassNames: [],
      stripClassNames: true,
      stripDataAttributes: true,
    });

    // FIXME: This is not working as expected a bit redundant for data attributes
    expect(html).toContain(
      '<em data-slate-bold="true" data-slate-italic="true"><strong data-slate-bold="true" data-slate-italic="true"><span>bold and italic</span></strong></em>'
    );
  });
});
