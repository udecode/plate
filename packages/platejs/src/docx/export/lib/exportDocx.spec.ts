import JSZip from 'jszip';
import { all, createLowlight } from 'lowlight';
import React from 'react';

import { createEditor, definePlugin, type Value } from '../../../core';
import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseHeadingPlugin,
} from '../../../features/basic-nodes';
import {
  BaseLineHeightPlugin,
  BaseTextAlignPlugin,
  BaseTextIndentPlugin,
} from '../../../features/basic-styles';
import { BaseCalloutPlugin } from '../../../features/callout';
import {
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
} from '../../../features/code-block/lib/BaseCodeBlockPlugin';
import { BaseIndentPlugin } from '../../../features/indent';
import {
  BaseColumnItemPlugin,
  BaseColumnGroupPlugin,
} from '../../../features/layout';
import { BaseListPlugin } from '../../../features/list';
import { BaseTocPlugin, readTocHeadings } from '../../../features/toc';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from '../../../math';
import { EditorStatic, type EditorStaticProps } from '../../../static';
import { importDocx } from '../../import/lib/importDocx';
import { exportDocx } from './exportDocx';

const exportEquationXml = async (latex: string, inline = false) => {
  const editor = createEditor({
    initialValue: inline
      ? [
          {
            children: [
              { text: 'Inline ' },
              { children: [{ text: '' }], latex, type: 'inlineEquation' },
            ],
            type: 'paragraph',
          },
        ]
      : [{ children: [{ text: '' }], latex, type: 'equation' }],
    plugins: [BaseEquationPlugin, BaseInlineEquationPlugin],
  });
  const result = await exportDocx(editor, { projection: 'proposed' });

  if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
  const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());

  return zip.file('word/document.xml')!.async('string');
};

const xmlText = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

describe('exportDocx equations', () => {
  it('exports a block equation as Word math', async () => {
    const xml = await exportEquationXml('\\frac{a}{b}');

    expect(xml).toMatch(/<m:oMathPara[ >]/);
    expect(xml).toContain('<m:f>');
    expect(xml).not.toContain('\\frac');
  });

  it('exports an inline equation as Word math beside its text', async () => {
    const xml = await exportEquationXml('x^2', true);

    expect(xml).toContain('<m:sSup>');
    expect(xml).not.toMatch(/<m:oMathPara[ >]/);
    expect(xml).toContain('Inline ');
  });

  it('keeps a math font such as double-struck', async () => {
    const xml = await exportEquationXml('\\mathbb{R}');

    expect(xml).toContain('<m:scr m:val="double-struck"/>');
  });

  it('converts common notation instead of falling back to its TeX', async () => {
    const sources = [
      'f(x, y)',
      "x'",
      '\\binom{n}{k}',
      'a\\quad b',
      '\\left(x\\right)',
      '\\big(x\\big)',
      '\\overline{x}',
      '\\underline{x}',
      '\\sum_{i=1}^n i',
      '\\int_0^1 x\\,dx',
      '\\alpha \\le \\infty',
      '\\sin x',
    ];
    const fellBack: string[] = [];

    for (const source of sources) {
      const xml = await exportEquationXml(source);

      if (!/<m:oMath[ >]/.test(xml) || xml.includes(xmlText(source))) {
        fellBack.push(source);
      }
    }

    expect(fellBack).toEqual([]);
  });

  it('keeps malformed TeX as one normal-text math run', async () => {
    const xml = await exportEquationXml('\\frac{');

    expect(xml).toMatch(
      /<m:oMath[^>]*>\s*<m:r>\s*<m:rPr>\s*<m:nor\/>\s*<\/m:rPr>\s*<m:t[^>]*>\\frac\{<\/m:t>\s*<\/m:r>\s*<\/m:oMath>/
    );
  });

  it('keeps notation Word math cannot express as its TeX', async () => {
    const xml = await exportEquationXml('\\raisebox{1em}{x}');

    expect(xml).toContain('<m:nor/>');
    expect(xml).toContain('\\raisebox{1em}{x}');
  });

  it('writes a text-only equation as its TeX', async () => {
    const xml = await exportEquationXml('\\text{50\\% off}');

    expect(xml).toContain('<m:nor/>');
    expect(xml).toContain('\\text{50\\% off}');
  });

  it('writes text beside math that draws nothing as its TeX', async () => {
    const xml = await exportEquationXml('\\text{a}\\hspace{0pt}');

    expect(xml).toMatch(/<m:oMath[ >]/);
    expect(xml).toContain('<m:nor/>');
    expect(xml).toContain('\\text{a}\\hspace{0pt}');
  });

  it('keeps a nine-em space as Word math', async () => {
    expect(await exportEquationXml('x\\hspace{9em}y')).not.toContain(
      '<m:nor/>'
    );
  });

  it('keeps a space too wide for Word math as its TeX', async () => {
    const xml = await exportEquationXml('x\\hspace{1000000000em}y');

    expect(xml).toContain('<m:nor/>');
    expect(xml).toContain('x\\hspace{1000000000em}y');
  });

  it('stacks a symbol over a relation', async () => {
    expect(await exportEquationXml('\\overset{+}{=}')).toContain('<m:limUpp>');
  });

  it('stacks a symbol over a letter', async () => {
    expect(await exportEquationXml('\\overset{+}{x}')).toContain('<m:limUpp>');
  });

  it('keeps a stretchy brace as its TeX', async () => {
    const xml = await exportEquationXml('\\overbrace{a+b}^{n}');

    expect(xml).toContain('<m:nor/>');
    expect(xml).toContain('\\overbrace{a+b}^{n}');
  });
});

describe('exportDocx', () => {
  afterEach(() => {
    mock.restore();
  });

  it('converts one captured editor projection with caller options', async () => {
    const editor = createEditor({
      plugins: [],
      initialValue: [{ children: [{ text: 'Export me' }], type: 'paragraph' }],
    });
    const result = await exportDocx(editor, {
      orientation: 'landscape',
      projection: 'proposed',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { blob } = result;
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');

    expect(documentXml).not.toContain('Calibri');
    expect(documentXml).toContain('Export me');
    expect(documentXml).toContain('w:orient="landscape"');
  });

  it('uses the current editor configuration', async () => {
    const SerializationPlugin = definePlugin('serialization', {});
    const editor = createEditor({
      plugins: [SerializationPlugin],
      initialValue: [{ children: [{ text: 'Export me' }], type: 'paragraph' }],
    });

    const result = await exportDocx(editor, {
      projection: 'proposed',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.blob).toBeInstanceOf(Blob);
  });

  it('rethrows caller serializer failures', async () => {
    const editor = createEditor({
      plugins: [],
      initialValue: [{ children: [{ text: 'Export me' }], type: 'paragraph' }],
    });
    const BrokenStatic = () => {
      throw new Error('broken serializer');
    };

    await expect(
      exportDocx(editor, {
        component: BrokenStatic,
        projection: 'proposed',
      })
    ).rejects.toThrow('broken serializer');
  });

  it('rejects an already-aborted export with its reason', async () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'Export me' }], type: 'paragraph' }],
    });
    const controller = new AbortController();
    const reason = { code: 'cancelled-before-export' };

    controller.abort(reason);

    await expect(
      exportDocx(editor, {
        projection: 'proposed',
        signal: controller.signal,
      })
    ).rejects.toBe(reason);
  });

  it('rejects when aborted while rendering the export', async () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'Export me' }], type: 'paragraph' }],
    });
    const controller = new AbortController();
    const reason = { code: 'cancelled-during-export' };
    const AbortingStatic = () => {
      controller.abort(reason);

      return null;
    };

    await expect(
      exportDocx(editor, {
        component: AbortingStatic,
        projection: 'proposed',
        signal: controller.signal,
      })
    ).rejects.toBe(reason);
  });

  it('applies the caller stylesheet and preserves marked whitespace', async () => {
    const lowlight = createLowlight(all);
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: '  const value = 1;' }],
          language: 'javascript',
          type: 'codeBlock',
        },
      ],
      plugins: [
        BaseCodeBlockPlugin,
        BaseCodeHighlightPlugin.configure({
          initialState: { lowlight },
        }),
      ],
    });
    const result = await exportDocx(editor, {
      projection: 'proposed',
      stylesheet: '.hljs-keyword { color: #123456; }',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { blob } = result;
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');

    expect(documentXml).toContain('w:color w:val="123456"');
    expect(documentXml).not.toContain('w:color w:val="005cc5"');
    expect(documentXml).toContain('>\u00A0\u00A0</w:t>');
  });

  it('exports a callout under a stylesheet that styles table cells', async () => {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'Callout' }], icon: '💡', type: 'callout' },
      ],
      plugins: [BaseCalloutPlugin],
    });

    const result = await exportDocx(editor, {
      projection: 'proposed',
      stylesheet: 'th, td { padding: 6pt; }',
    });

    expect(result.ok).toBe(true);
  });

  it('shades both callout cells with the callout color', async () => {
    const editor = createEditor({
      initialValue: [
        {
          backgroundColor: '#fde68a',
          children: [{ text: 'Warm' }],
          icon: '🔥',
          type: 'callout',
        },
      ],
      plugins: [BaseCalloutPlugin],
    });

    const result = await exportDocx(editor, { projection: 'proposed' });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');

    expect(documentXml.match(/w:fill="fde68a"/gi)).toHaveLength(2);
  });

  it('leaves callout cells unshaded for a color Word cannot read', async () => {
    const editor = createEditor({
      initialValue: [
        {
          backgroundColor: 'rgba(253, 230, 138, 0.5)',
          children: [{ text: 'Warm' }],
          icon: '🔥',
          type: 'callout',
        },
      ],
      plugins: [BaseCalloutPlugin],
    });

    const result = await exportDocx(editor, { projection: 'proposed' });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');

    expect(documentXml).not.toContain('w:fill="000000"');
  });

  it('owns required Word renderers without registry components', async () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'Package heading' }],
          level: 1,
          type: 'heading',
        },
        {
          children: [{ text: '' }],
          type: 'toc',
        },
        {
          children: [
            { text: 'Inline equation: ' },
            {
              children: [{ text: '' }],
              latex: 'E = mc^2',
              type: 'inlineEquation',
            },
          ],
          type: 'paragraph',
        },
        {
          children: [{ text: '' }],
          latex: 'x^2 + y^2',
          type: 'equation',
        },
        {
          children: [{ text: 'Callout body' }],
          icon: '💡',
          type: 'callout',
        },
        {
          children: [
            {
              children: [
                {
                  children: [{ text: 'First column' }],
                  type: 'paragraph',
                },
              ],
              type: 'column',
              width: '50%',
            },
            {
              children: [
                {
                  children: [{ text: 'Second column' }],
                  type: 'paragraph',
                },
              ],
              type: 'column',
              width: '50%',
            },
          ],
          type: 'columnGroup',
        },
      ],
      plugins: [
        BaseHeadingPlugin,
        BaseTocPlugin,
        BaseEquationPlugin,
        BaseInlineEquationPlugin,
        BaseCalloutPlugin,
        BaseColumnGroupPlugin,
        BaseColumnItemPlugin,
      ],
    });

    const result = await exportDocx(editor, { projection: 'proposed' });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');

    expect(documentXml).toContain('Package heading');
    expect(documentXml).toContain('Callout body');
    expect(documentXml).toContain('First column');
    expect(documentXml).toContain('Second column');
    expect(documentXml.match(/<w:tbl>/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it('exports Word comment ranges and rich comment metadata', async () => {
    const editor = createEditor({
      plugins: [BaseBoldPlugin],
      initialValue: [
        { children: [{ text: 'Review this sentence.' }], type: 'paragraph' },
      ],
    });
    const result = await exportDocx(editor, {
      comments: [
        {
          author: { initials: 'AL', name: 'Ada Lovelace' },
          body: [
            {
              children: [{ bold: true, text: 'Please revise.' }],
              type: 'paragraph',
            },
          ],
          createdAt: '2026-09-15T10:00:00.000Z',
          durableId: 'A1B2C3D4',
          id: 'comment-1',
          parentId: null,
          resolved: false,
          target: {
            range: {
              anchor: { offset: 0, path: [0, 0] },
              focus: { offset: 6, path: [0, 0] },
            },
          },
        },
      ],
      projection: 'proposed',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');
    const commentsXml = await zip.file('word/comments.xml')!.async('string');

    expect(documentXml).toContain('<w:commentRangeStart');
    expect(documentXml).toContain('<w:commentRangeEnd');
    expect(commentsXml).toContain('Please revise.');
    expect(commentsXml).toMatch(/<(?:w:)?b\/>/);
    expect(commentsXml).toContain('Ada Lovelace');

    const imported = await importDocx(await result.blob.arrayBuffer(), {
      plugins: [BaseBoldPlugin],
    });

    expect(imported.ok).toBe(true);
    if (!imported.ok) return;
    expect(imported.comments[0]).toEqual(
      expect.objectContaining({
        author: { initials: 'AL', name: 'Ada Lovelace' },
        body: [
          {
            children: [{ bold: true, text: 'Please revise.' }],
            type: 'paragraph',
          },
        ],
        createdAt: '2026-09-15T10:00:00.000Z',
        durableId: 'A1B2C3D4',
        resolved: false,
        target: {
          range: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 6, path: [0, 0] },
          },
        },
      })
    );
  });
});

describe('exportDocx table of contents', () => {
  const exportTocRows = async (tocPlugin: typeof BaseTocPlugin) => {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: '' }], type: 'toc' },
        { children: [{ text: 'One' }], level: 1, type: 'heading' },
        { children: [{ text: 'Two' }], level: 2, type: 'heading' },
        { children: [{ text: 'Three' }], level: 3, type: 'heading' },
        { children: [{ text: 'Four' }], level: 4, type: 'heading' },
        { children: [{ text: 'Five' }], level: 5, type: 'heading' },
        { children: [{ text: 'Six' }], level: 6, type: 'heading' },
      ],
      plugins: [BaseHeadingPlugin, tocPlugin],
    });
    const result = await exportDocx(editor, { projection: 'proposed' });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');

    return [...documentXml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)]
      .map(([paragraph]) => paragraph)
      .filter((paragraph) => paragraph.includes('<w:hyperlink'))
      .map((paragraph) => ({
        left: paragraph.match(/<w:ind\b[^>]*w:left="(\d+)"/)?.[1] ?? '0',
        text: [...paragraph.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)]
          .map(([, text]) => text)
          .join(''),
      }));
  };

  it('indents each row by its heading level', async () => {
    expect(await exportTocRows(BaseTocPlugin)).toEqual([
      { left: '0', text: 'One' },
      { left: '360', text: 'Two' },
      { left: '720', text: 'Three' },
      { left: '1080', text: 'Four' },
      { left: '1440', text: 'Five' },
      { left: '1800', text: 'Six' },
    ]);
  });

  it('writes the rows of an app read override', async () => {
    const rows = await exportTocRows(
      BaseTocPlugin.extend({
        read: ({ editor, state }) => ({
          headings: () =>
            readTocHeadings({ editor, state }).filter(
              (heading) => heading.level <= 3
            ),
        }),
      })
    );

    expect(rows.map(({ text }) => text)).toEqual(['One', 'Two', 'Three']);
  });
});

describe('exportDocx loss policy', () => {
  const unanchoredComment = {
    author: null,
    body: [{ children: [{ text: 'Detached note' }], type: 'paragraph' }],
    createdAt: null,
    durableId: null,
    id: 'detached',
    parentId: null,
    resolved: null,
    target: null,
  } as const;

  it('rejects dropped content by default and warns under allow', async () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'Body' }], type: 'paragraph' }],
    });
    const rejected = await exportDocx(editor, {
      comments: [unanchoredComment],
      projection: 'proposed',
    });
    const allowed = await exportDocx(editor, {
      comments: [unanchoredComment],
      lossPolicy: 'allow',
      projection: 'proposed',
    });

    expect(rejected).toEqual({
      diagnostics: [
        expect.objectContaining({
          code: 'lossy-content',
          feature: 'comment-range',
          severity: 'error',
        }),
      ],
      ok: false,
    });
    expect(allowed.ok).toBe(true);
    expect(allowed.diagnostics).toEqual([
      expect.objectContaining({
        code: 'lossy-content',
        feature: 'comment-range',
        severity: 'warning',
      }),
    ]);
  });

  it('keeps omitted document metadata a warning under reject', async () => {
    const editor = createEditor({
      initialValue: {
        children: [{ children: [{ text: 'Body' }], type: 'paragraph' }],
        meta: { reviewer: 'Ada' },
      },
    });
    const result = await exportDocx(editor, { projection: 'proposed' });

    expect(result.ok).toBe(true);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'lossy-content',
        feature: 'document-metadata',
        severity: 'warning',
      }),
    ]);
  });

  it('treats a null source as no source', async () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'Body' }], type: 'paragraph' }],
    });
    const result = await exportDocx(editor, {
      projection: 'review',
      source: null,
    });

    expect(result.ok).toBe(true);
    expect(result.diagnostics).toEqual([]);
  });

  it('throws for an invalid loss policy', async () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'Body' }], type: 'paragraph' }],
    });

    await expect(
      exportDocx(editor, {
        // @ts-expect-error Loss policy accepts only allow or reject.
        lossPolicy: 'warn',
        projection: 'proposed',
      })
    ).rejects.toThrow('lossPolicy must be "allow" or "reject".');
  });
});

describe('exportDocx output safety', () => {
  const PNG =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  const GIF = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  const WEBP = 'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';

  afterEach(() => {
    mock.restore();
  });

  // Custom static renderers are where markup the schema never stored appears.
  const exportWithMarkup = (
    markup: string,
    options: Omit<Parameters<typeof exportDocx>[1], 'component'> = {
      projection: 'proposed',
    }
  ) =>
    exportDocx(
      createEditor({
        initialValue: [{ children: [{ text: 'Body' }], type: 'paragraph' }],
      }),
      {
        ...options,
        component: (props: EditorStaticProps) =>
          React.createElement(
            'div',
            null,
            React.createElement(EditorStatic, props),
            React.createElement('div', {
              dangerouslySetInnerHTML: { __html: markup },
            })
          ),
      }
    );

  const readPackage = async (blob: Blob) => {
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const [documentXml, relationships, contentTypes] = await Promise.all(
      [
        'word/document.xml',
        'word/_rels/document.xml.rels',
        '[Content_Types].xml',
      ].map((name) => zip.file(name)!.async('string'))
    );

    return { contentTypes, documentXml, relationships, zip };
  };

  it('writes only safe absolute link destinations and keeps every label', async () => {
    const result = await exportWithMarkup(
      [
        '<p><a href="javascript:alert(1)">SCRIPT</a> ',
        '<a href="data:text/html;base64,SGVsbG8=">DATA</a> ',
        '<a href="guide/next">RELATIVE</a> ',
        '<a href=" https://example.com/ok ">SAFE <strong>BOLD</strong></a> ',
        '<a href="mailto:team@example.com">MAIL</a></p>',
      ].join('')
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { documentXml, relationships } = await readPackage(result.blob);

    for (const label of [
      'SCRIPT',
      'DATA',
      'RELATIVE',
      'SAFE ',
      'BOLD',
      'MAIL',
    ]) {
      expect(documentXml).toContain(label);
    }
    expect(relationships).toContain('Target="https://example.com/ok"');
    expect(relationships).toContain('Target="mailto:team@example.com"');
    expect(relationships).not.toContain('javascript:');
    expect(relationships).not.toContain('data:');
    expect(relationships).not.toContain('guide/next');
    expect(result.diagnostics).toEqual([
      expect.objectContaining({ action: 'unwrapped', feature: 'link' }),
      expect.objectContaining({ action: 'unwrapped', feature: 'link' }),
      expect.objectContaining({ action: 'unwrapped', feature: 'link' }),
    ]);
  });

  it('omits images DOCX cannot embed and rejects that loss by default', async () => {
    const markup = [
      `<p><img src="data:image/png;base64,${PNG}" alt="Kept PNG"></p>`,
      `<p><img src="data:image/gif;base64,${GIF}" alt="Kept GIF"></p>`,
      `<p><img src="data:image/webp;base64,${WEBP}" alt="Webp diagram"></p>`,
      '<p><img src="https://example.com/remote.png" alt="Remote chart"></p>',
      '<p><img src="blob:https://example.com/0000" alt="Transient"></p>',
      '<p><img src="media/local.png"></p>',
      '<p><img src="javascript:alert(1)"></p>',
    ].join('');
    const rejected = await exportWithMarkup(markup);
    const allowed = await exportWithMarkup(markup, {
      lossPolicy: 'allow',
      projection: 'proposed',
    });

    expect(rejected.ok).toBe(false);
    expect(
      rejected.diagnostics.filter(
        (diagnostic) =>
          diagnostic.code === 'resource-omitted' &&
          diagnostic.severity === 'error'
      )
    ).toHaveLength(5);
    expect(allowed.ok).toBe(true);
    if (!allowed.ok) return;
    const { contentTypes, documentXml, zip } = await readPackage(allowed.blob);
    const media = Object.values(zip.files)
      .filter((file) => !file.dir && file.name.startsWith('word/media/'))
      .map(({ name }) => name);

    expect(
      media
        .map((name) => name.split('.').at(-1) ?? '')
        .sort((left, right) => left.localeCompare(right))
    ).toEqual(['gif', 'png']);
    expect(contentTypes).toContain('Extension="gif"');
    expect(documentXml).toContain('Webp diagram');
    expect(documentXml).toContain('Remote chart');
    expect(documentXml).toContain('Transient');
    expect(allowed.diagnostics).toHaveLength(5);
  });

  it('embeds fetched remote images only with allowRemoteImages', async () => {
    const png = Uint8Array.from(atob(PNG), (character) =>
      character.charCodeAt(0)
    );
    const fetchSpy = spyOn(globalThis, 'fetch').mockImplementation(((
      url: string
    ) =>
      Promise.resolve(
        url.endsWith('missing.png')
          ? new Response(null, { status: 404 })
          : new Response(png)
      )) as typeof fetch);
    const result = await exportWithMarkup(
      '<p><img src="https://example.com/a.png" alt="A"><img src="https://example.com/missing.png" alt="Missing"></p>',
      { allowRemoteImages: true, lossPolicy: 'allow', projection: 'proposed' }
    );

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { zip } = await readPackage(result.blob);

    expect(
      Object.values(zip.files).filter(
        (file) => !file.dir && file.name.startsWith('word/media/')
      )
    ).toHaveLength(1);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'resource-omitted',
        message: expect.stringContaining('could not be fetched'),
      }),
    ]);
  });
});

describe('exportDocx layout values', () => {
  const paragraphProperties = async (
    initialValue: Value,
    stylesheet?: string
  ) => {
    const editor = createEditor({
      initialValue,
      plugins: [
        BaseBlockquotePlugin,
        BaseHeadingPlugin,
        BaseIndentPlugin.configure({
          targetPlugins: ['paragraph', 'heading'],
        }),
        BaseLineHeightPlugin,
        BaseListPlugin.configure({
          slots: {
            wrapNodeChildren: ({ element }) =>
              element.listType
                ? ({ children }) =>
                    React.createElement(
                      'ol',
                      { 'data-list-id': 'list' },
                      React.createElement(
                        'li',
                        { 'data-indent': element.indent },
                        children
                      )
                    )
                : undefined,
          },
          targetPlugins: ['paragraph', 'heading'],
        }),
        BaseTextAlignPlugin,
        BaseTextIndentPlugin.configure({
          targetPlugins: ['paragraph', 'blockquote', 'heading'],
        }),
      ],
    });
    const result = await exportDocx(editor, {
      projection: 'proposed',
      stylesheet,
    });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');

    return Object.fromEntries(
      [...documentXml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)].map(([paragraph]) => [
        [...paragraph.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)]
          .map(([, text]) => text)
          .join(''),
        paragraph.match(/<w:pPr>[\s\S]*?<\/w:pPr>/)?.[0] ?? '',
      ])
    );
  };
  const paragraph = (text: string, properties: Record<string, unknown>) => ({
    children: [{ text }],
    type: 'paragraph',
    ...properties,
  });

  it('writes a line height multiplier as whole 240ths of a line', async () => {
    const properties = await paragraphProperties([
      paragraph('Loose', { lineHeight: 1.75 }),
      paragraph('Word', { lineHeight: 1.07 }),
    ]);

    expect(properties.Loose).toContain('w:line="420"');
    expect(properties.Word).toContain('w:line="257"');
  });

  it('keeps line spacing independent of the paragraph font size', async () => {
    const properties = await paragraphProperties(
      [paragraph('Large', { lineHeight: 2 })],
      '.editor-paragraph { font-size: 20pt; }'
    );

    expect(properties.Large).toContain('w:line="480"');
  });

  it.each([
    ['24px', '360', 'atLeast'],
    ['18pt', '360', 'atLeast'],
    ['1cm', '567', 'atLeast'],
    ['0.1in', '144', 'atLeast'],
    ['115%', '276', 'auto'],
    ['1.5em', '360', 'auto'],
    ['1.5e0', '360', 'auto'],
  ])(
    'writes a stylesheet line height of %s as w:line %s under %s',
    async (css, line, lineRule) => {
      const properties = await paragraphProperties(
        [paragraph('Styled', {})],
        `.editor-paragraph { line-height: ${css}; }`
      );

      expect(properties.Styled).toContain(`w:line="${line}"`);
      expect(properties.Styled).toContain(`w:lineRule="${lineRule}"`);
    }
  );

  it.each(['normal', 'calc(1.5)', '0'])(
    'writes no line spacing for a stylesheet line height of %s',
    async (css) => {
      const properties = await paragraphProperties(
        [paragraph('Styled', {})],
        `.editor-paragraph { line-height: ${css}; }`
      );

      expect(properties.Styled).not.toContain('w:line=');
    }
  );

  it.each([
    ['margin: 0 0 8pt 0', '0', '160'],
    ['margin: 6pt 0', '120', '120'],
    ['margin: 3pt', '60', '60'],
    ['margin: 2pt 0 10px', '40', '150'],
    ['margin-top: 4pt; margin-bottom: 12pt', '80', '240'],
    ['margin: 0; margin-bottom: 9pt', '0', '180'],
  ])(
    'writes a stylesheet %s as space before %s and after %s',
    async (css, before, after) => {
      const properties = await paragraphProperties(
        [paragraph('Spaced', {})],
        `.editor-paragraph { ${css}; }`
      );

      expect(properties.Spaced).toContain(
        `<w:spacing w:before="${before}" w:after="${after}" w:lineRule="auto"/>`
      );
    }
  );

  it('lets a heading margin replace the Word heading spacing', async () => {
    const properties = await paragraphProperties(
      [{ children: [{ text: 'Title' }], level: 1, type: 'heading' }],
      'h1 { margin: 0 0 12pt 0; }'
    );

    expect(properties.Title).toContain(
      '<w:spacing w:before="0" w:after="240" w:lineRule="auto"/>'
    );
  });

  it('drops a negative margin, which Word spacing cannot hold', async () => {
    const properties = await paragraphProperties(
      [paragraph('Pulled', {})],
      '.editor-paragraph { margin-top: -4pt; }'
    );

    expect(properties.Pulled).not.toContain('w:before=');
  });

  it('maps logical and justified alignment to Word alignment', async () => {
    const properties = await paragraphProperties([
      paragraph('Start', { textAlign: 'start' }),
      paragraph('End', { textAlign: 'end' }),
      paragraph('Justify', { textAlign: 'justify' }),
    ]);

    expect(properties.Start).toContain('<w:jc w:val="left"/>');
    expect(properties.End).toContain('<w:jc w:val="right"/>');
    expect(properties.Justify).toContain('<w:jc w:val="both"/>');
  });

  it('writes a positive text indent as a first-line indent', async () => {
    const properties = await paragraphProperties([
      paragraph('Indented', { textIndent: 1 }),
    ]);

    expect(properties.Indented).toContain('<w:ind w:firstLine="360"/>');
  });

  it('writes a negative text indent as a hanging indent', async () => {
    const properties = await paragraphProperties([
      paragraph('Hanging', { textIndent: -1 }),
    ]);

    expect(properties.Hanging).toContain('<w:ind w:hanging="360"/>');
  });

  it('writes a margin and a text indent into one indentation', async () => {
    const properties = await paragraphProperties([
      paragraph('Both', { indent: 2, textIndent: 1 }),
    ]);

    expect(properties.Both.match(/<w:ind\b[^>]*\/>/g)).toEqual([
      '<w:ind w:left="720" w:firstLine="360"/>',
    ]);
  });

  it('keeps the blockquote indent beside its text indent', async () => {
    const properties = await paragraphProperties([
      { children: [{ text: 'Quoted' }], textIndent: 1, type: 'blockquote' },
    ]);

    expect(properties.Quoted.match(/<w:ind\b[^>]*\/>/g)).toEqual([
      '<w:ind w:left="284" w:firstLine="360"/>',
    ]);
  });

  it('leaves a numbered block to its list level indent', async () => {
    const properties = await paragraphProperties([
      {
        children: [{ text: 'Item' }],
        indent: 1,
        level: 1,
        listType: 'numbered',
        textIndent: 1,
        type: 'heading',
      },
    ]);

    expect(properties.Item).toContain('<w:numPr>');
    expect(properties.Item).not.toContain('<w:ind');
  });

  it('keeps the line height and alignment of a numbered paragraph', async () => {
    const properties = await paragraphProperties([
      paragraph('Listed', {
        indent: 1,
        lineHeight: 1.75,
        listType: 'numbered',
        textAlign: 'end',
      }),
    ]);

    expect(properties.Listed).toContain('<w:numPr>');
    expect(properties.Listed).toContain('<w:jc w:val="right"/>');
    expect(properties.Listed).toContain('w:line="420"');
  });

  it('lets a list item style override the numbered paragraph', async () => {
    const properties = await paragraphProperties(
      [
        paragraph('Listed', {
          indent: 1,
          lineHeight: 1.75,
          listType: 'numbered',
          textAlign: 'end',
        }),
      ],
      'li { line-height: 2; text-align: center; }'
    );

    expect(properties.Listed).toContain('<w:numPr>');
    expect(properties.Listed).toContain('<w:jc w:val="center"/>');
    expect(properties.Listed).toContain('w:line="480"');
  });
});

it('applies the document title to DOCX metadata', async () => {
  const editor = createEditor({
    initialValue: [{ type: 'paragraph', children: [{ text: 'Body' }] }],
  });
  const result = await exportDocx(editor, {
    projection: 'proposed',
    title: 'Review document',
  });
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  const { blob } = result;
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  expect(await zip.file('docProps/core.xml')!.async('string')).toContain(
    '<dc:title>Review document</dc:title>'
  );
});
