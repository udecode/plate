import JSZip from 'jszip';
import { all, createLowlight } from 'lowlight';
import React from 'react';

import { createEditor, definePlugin } from '../../../core';
import {
  BaseBoldPlugin,
  BaseHeadingPlugin,
} from '../../../features/basic-nodes';
import { BaseCalloutPlugin } from '../../../features/callout';
import {
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
} from '../../../features/code-block/lib/BaseCodeBlockPlugin';
import {
  BaseColumnItemPlugin,
  BaseColumnPlugin,
} from '../../../features/layout';
import { BaseTocPlugin } from '../../../features/toc';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from '../../../math';
import { EditorStatic, type EditorStaticProps } from '../../../static';
import { importDocx } from '../../import/lib/importDocx';
import { exportDocx } from './exportDocx';

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
        BaseColumnPlugin,
        BaseColumnItemPlugin,
      ],
    });

    const result = await exportDocx(editor, { projection: 'proposed' });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');

    expect(documentXml).toContain('Package heading');
    expect(documentXml).toContain('E = mc^2');
    expect(documentXml).toContain('x^2 + y^2');
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
