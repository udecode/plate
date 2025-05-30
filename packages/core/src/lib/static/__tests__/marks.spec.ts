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
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toContain(
      '<span data-slate-leaf="true" data-slate-bold="true"><strong><span data-slate-string="true">bold</span></strong></span>'
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
      preserveClassNames: [],
      stripClassNames: true,
    });
    expect(html).toContain(
      '<span data-slate-leaf="true" data-slate-italic="true"><em><span data-slate-string="true">italic</span></em></span>'
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
      preserveClassNames: [],
      stripClassNames: true,
    });
    expect(html).toContain(
      '<span data-slate-leaf="true" data-slate-underline="true"><u><span data-slate-string="true">underlined</span></u></span>'
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
      preserveClassNames: [],
      stripClassNames: true,
    });
    expect(html).toContain(
      '<span data-slate-leaf="true" data-slate-strikethrough="true"><s><span data-slate-string="true">strikethrough</span></s></span>'
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
      preserveClassNames: [],
      stripClassNames: true,
    });
    expect(html).toContain(
      '<span data-slate-leaf="true" data-slate-code="true"><code><span data-slate-string="true">some code</span></code></span>'
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
      preserveClassNames: [],
      stripClassNames: true,
    });
    expect(html).toContain(
      '<span data-slate-leaf="true" data-slate-subscript="true"><sub><span data-slate-string="true">subscripted</span></sub></span>'
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
      preserveClassNames: [],
      stripClassNames: true,
    });
    expect(html).toContain(
      '<span data-slate-leaf="true" data-slate-superscript="true"><sup><span data-slate-string="true">superscripted</span></sup></span>'
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
      preserveClassNames: [],
      stripClassNames: true,
    });
    expect(html).toContain(
      '<span data-slate-leaf="true" data-slate-kbd="true"><kbd><span data-slate-string="true">keyboard shortcut</span></kbd></span>'
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
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toContain(
      '<span data-slate-leaf="true" data-slate-bold="true" data-slate-italic="true"><em><strong><span data-slate-string="true">bold and italic</span></strong></em></span>'
    );
  });
});
