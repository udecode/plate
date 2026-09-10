import JSZip from 'jszip';
import { all, createLowlight } from 'lowlight';
import React from 'react';

import { createEditor, defineBasePlugin } from '../../../core';
import {
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
} from '../../../features/code-block/lib/BaseCodeBlockPlugin';
import { exportToDocx } from './exportToDocx';

describe('exportToDocx', () => {
  afterEach(() => {
    mock.restore();
  });

  it('converts an explicit document snapshot with caller options', async () => {
    const editor = createEditor({
      plugins: [],
      initialValue: [{ children: [{ text: 'Export me' }], type: 'paragraph' }],
    });
    const blob = await exportToDocx(editor.read.value().children, {
      orientation: 'landscape',
    });
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');

    expect(documentXml).not.toContain('Calibri');
    expect(documentXml).toContain('Export me');
    expect(documentXml).toContain('w:orient="landscape"');
  });

  it('uses explicit plugin descriptors for the export editor', async () => {
    const SerializationPlugin = defineBasePlugin('serialization', {});
    const editor = createEditor({
      plugins: [SerializationPlugin],
      initialValue: [{ children: [{ text: 'Export me' }], type: 'paragraph' }],
    });

    const blob = await exportToDocx(editor.read.value().children, {
      editorPlugins: [SerializationPlugin],
    });

    expect(blob).toBeInstanceOf(Blob);
  });

  it('applies the caller stylesheet and preserves marked whitespace', async () => {
    const lowlight = createLowlight(all);
    const value = [
      {
        children: [{ text: '  const value = 1;' }],
        language: 'javascript',
        type: 'codeBlock',
      },
    ];
    const blob = await exportToDocx(value, {
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
      stylesheet: '.hljs-keyword { color: #123456; }',
    });
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');

    expect(documentXml).toContain('w:color w:val="123456"');
    expect(documentXml).not.toContain('w:color w:val="005cc5"');
    expect(documentXml).toContain('>\u00A0\u00A0</w:t>');
  });
});

it('applies the document title to DOCX metadata', async () => {
  const blob = await exportToDocx(
    [{ type: 'paragraph', children: [{ text: 'Body' }] }],
    { title: 'Review document' }
  );
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  expect(await zip.file('docProps/core.xml')!.async('string')).toContain(
    '<dc:title>Review document</dc:title>'
  );
});
