import { createEditor } from '../../core';
import { BaseLinkPlugin } from '../../features/link';
import { createTestEditor } from './__tests__/createTestEditor';
import { MarkdownPlugin } from './MarkdownPlugin';

describe('Markdown destination safety', () => {
  const editor = createTestEditor();

  it('unwraps a script link to its label as a lossless warning', () => {
    for (const lossPolicy of ['allow', 'reject'] as const) {
      const result = editor.api.markdown.parse(
        'Before [label](javascript:alert(1)) after',
        { lossPolicy }
      );

      expect(result).toMatchObject({
        diagnostics: [
          {
            code: 'markdown-unsafe-content',
            impact: 'lossless',
            nodeType: 'link',
            severity: 'warning',
          },
        ],
        document: {
          children: [
            {
              children: [{ text: 'Before label after' }],
              type: 'paragraph',
            },
          ],
        },
        ok: true,
      });
    }
  });

  it('replaces a script image with its alt text as a lossless warning', () => {
    expect(
      editor.api.markdown.parse('![diagram](javascript:alert(1))')
    ).toMatchObject({
      diagnostics: [
        {
          code: 'markdown-unsafe-content',
          impact: 'lossless',
          nodeType: 'image',
          severity: 'warning',
        },
      ],
      document: {
        children: [{ children: [{ text: 'diagram' }], type: 'paragraph' }],
      },
      ok: true,
    });
  });

  it('replaces an image it cannot load with its alt text as a lossy result', () => {
    const source = '![diagram](data:image/svg+xml;base64,PHN2Zy8+)';

    expect(editor.api.markdown.parse(source).ok).toBe(false);
    expect(
      editor.api.markdown.parse(source, { lossPolicy: 'allow' })
    ).toMatchObject({
      diagnostics: [
        { code: 'markdown-unsafe-content', impact: 'lossy', nodeType: 'image' },
      ],
      document: {
        children: [{ children: [{ text: 'diagram' }], type: 'paragraph' }],
      },
      ok: true,
    });
  });

  it('removes a registered media element with a script source but keeps its caption', () => {
    expect(
      editor.api.markdown.parse(
        '<video src="javascript:alert(1)">\nCaption\n</video>'
      )
    ).toMatchObject({
      diagnostics: [
        {
          code: 'markdown-unsafe-content',
          impact: 'lossless',
          nodeType: 'video',
          severity: 'warning',
        },
      ],
      document: {
        children: [{ children: [{ text: 'Caption' }], type: 'paragraph' }],
      },
      ok: true,
    });
    expect(
      editor.api.markdown.parse('<img alt="Plate" src="vbscript:x" />')
    ).toMatchObject({
      diagnostics: [
        {
          code: 'markdown-unsafe-content',
          impact: 'lossless',
          nodeType: 'img',
        },
      ],
      document: {
        children: [{ children: [{ text: 'Plate' }], type: 'paragraph' }],
      },
      ok: true,
    });
    expect(
      editor.api.markdown.parse(
        '<figure>\n<img src="javascript:alert(1)" alt="Alt text" />\n<figcaption>Caption</figcaption>\n</figure>'
      )
    ).toMatchObject({
      diagnostics: [
        {
          code: 'markdown-unsafe-content',
          impact: 'lossless',
          nodeType: 'img',
        },
      ],
      document: {
        children: [{ children: [{ text: 'Caption' }], type: 'paragraph' }],
      },
      ok: true,
    });
  });

  it('removes a registered media element it cannot load as a real loss', () => {
    const source =
      '<video src="data:video/mp4;base64,AAAA">\nCaption\n</video>';

    expect(editor.api.markdown.parse(source).ok).toBe(false);
    expect(
      editor.api.markdown.parse(source, { lossPolicy: 'allow' })
    ).toMatchObject({
      diagnostics: [
        {
          action: 'unwrapped',
          code: 'markdown-unsupported-node',
          nodeType: 'video',
          severity: 'warning',
        },
      ],
      document: {
        children: [{ children: [{ text: 'Caption' }], type: 'paragraph' }],
      },
      ok: true,
    });
    // One removal, one report.
    expect(
      editor.api.markdown.parse(
        '<img src="ftp://example.com/a.png" alt="Alt text" />',
        { lossPolicy: 'allow' }
      ).diagnostics
    ).toMatchObject([
      {
        action: 'unwrapped',
        code: 'markdown-unsupported-node',
        impact: 'lossy',
      },
    ]);
  });

  it('keeps a destination it cannot keep as a label, with a real loss that warns', () => {
    const narrow = createEditor({
      plugins: [
        BaseLinkPlugin.configure({
          initialState: { allowedSchemes: ['https'] },
        }),
        MarkdownPlugin,
      ],
    });

    // The app's narrower schemes, under the default `reject`.
    expect(narrow.api.markdown.parse('[mail](mailto:a@b.c)')).toMatchObject({
      diagnostics: [
        {
          action: 'unwrapped',
          code: 'markdown-unsupported-node',
          impact: 'lossy',
          nodeType: 'link',
          severity: 'warning',
        },
      ],
      document: {
        children: [{ children: [{ text: 'mail' }], type: 'paragraph' }],
      },
      ok: true,
    });
    // A protocol-relative destination is meaningful, so losing it is lossy.
    expect(
      editor.api.markdown.parse('[page](//example.com/page)')
    ).toMatchObject({
      diagnostics: [
        {
          code: 'markdown-unsafe-content',
          impact: 'lossy',
          nodeType: 'link',
          severity: 'warning',
        },
      ],
      document: {
        children: [{ children: [{ text: 'page' }], type: 'paragraph' }],
      },
      ok: true,
    });
  });

  it('keeps an empty destination as an unresolved link', () => {
    const result = editor.api.markdown.parse('[label]()');

    expect(result.ok).toBe(true);
    expect(
      result.ok &&
        result.diagnostics.some(
          (diagnostic) => diagnostic.code === 'markdown-unsafe-content'
        )
    ).toBe(false);
    expect(result.ok && result.document.children[0]).toMatchObject({
      children: [{ text: '' }, { type: 'link', url: '' }, { text: '' }],
    });
  });
});
