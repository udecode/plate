import JSZip from 'jszip';
import { all, createLowlight } from 'lowlight';

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
