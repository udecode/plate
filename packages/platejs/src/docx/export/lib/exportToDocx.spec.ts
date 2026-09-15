import JSZip from 'jszip';
import { all, createLowlight } from 'lowlight';
import React from 'react';

import { createEditor, definePlugin } from '../../../core';
import { BaseBoldPlugin } from '../../../features/basic-nodes';
import {
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
} from '../../../features/code-block/lib/BaseCodeBlockPlugin';
import { importDocx } from '../../import/lib/importDocx';
import { exportToDocx } from './exportToDocx';

describe('exportToDocx', () => {
  afterEach(() => {
    mock.restore();
  });

  it('converts one captured editor projection with caller options', async () => {
    const editor = createEditor({
      plugins: [],
      initialValue: [{ children: [{ text: 'Export me' }], type: 'paragraph' }],
    });
    const result = await exportToDocx(editor, {
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

  it('uses explicit plugin descriptors for the export editor', async () => {
    const SerializationPlugin = definePlugin('serialization', {});
    const editor = createEditor({
      plugins: [SerializationPlugin],
      initialValue: [{ children: [{ text: 'Export me' }], type: 'paragraph' }],
    });

    const result = await exportToDocx(editor, {
      editorPlugins: [SerializationPlugin],
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
      exportToDocx(editor, {
        editorStaticComponent: BrokenStatic,
        projection: 'proposed',
      })
    ).rejects.toThrow('broken serializer');
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
      plugins: [BaseCodeBlockPlugin, BaseCodeHighlightPlugin],
    });
    const result = await exportToDocx(editor, {
      editorPlugins: [
        BaseCodeBlockPlugin.configure({
          component: ({ children }) =>
            React.createElement(
              'pre',
              { 'data-docx-preserve-whitespace': '' },
              children
            ),
        }),
        BaseCodeHighlightPlugin.configure({
          initialState: { lowlight },
        }),
      ],
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

  it('exports Word comment ranges and rich comment metadata', async () => {
    const editor = createEditor({
      plugins: [BaseBoldPlugin],
      initialValue: [
        { children: [{ text: 'Review this sentence.' }], type: 'paragraph' },
      ],
    });
    const result = await exportToDocx(editor, {
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
      editorPlugins: [BaseBoldPlugin],
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

    const imported = await importDocx(editor, await result.blob.arrayBuffer());

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
  const result = await exportToDocx(editor, {
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
