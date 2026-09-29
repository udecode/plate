import { describe, expect, it } from 'bun:test';

import type { DataTransferDiagnostic } from '../../../dom/plite-dom.internal';
import { BaseLinkPlugin } from '../../../features/link/lib/BaseLinkPlugin';
import { createEditor, type Editor } from '../../editor';
import { decodeHtmlDataTransfer } from './HtmlPlugin';

const decode = (editor: Editor, html: string, plainText = '') => {
  const reports: DataTransferDiagnostic[] = [];
  const slice = editor.read((state) =>
    decodeHtmlDataTransfer({
      data: html,
      mimeType: 'text/html',
      report: (diagnostic) => {
        reports.push(diagnostic);
      },
      snapshot: {
        files: Object.assign([], { item: () => null }),
        getData: (mimeType) =>
          mimeType === 'text/html'
            ? html
            : mimeType === 'text/plain'
              ? plainText
              : '',
        types: plainText ? ['text/html', 'text/plain'] : ['text/html'],
      },
      state,
    })
  );

  return { content: slice?.content ?? null, reports };
};

describe('HTML transfer reports', () => {
  it('reports a removed script destination as lossless and keeps its label', () => {
    expect(
      decode(
        createEditor({ plugins: [BaseLinkPlugin] }),
        '<p>Before <a href="javascript:alert(1)">LABEL</a> After</p>'
      )
    ).toEqual({
      content: [
        { children: [{ text: 'Before LABEL After' }], type: 'paragraph' },
      ],
      reports: [
        {
          impact: 'lossless',
          message: 'Removed unsafe HTML attribute "href" from <a>.',
        },
      ],
    });
  });

  it('reports dropped media as lossy', () => {
    expect(
      decode(createEditor(), '<p>Keep</p><img src="https://example.com/a.png">')
    ).toEqual({
      content: [{ children: [{ text: 'Keep' }], type: 'paragraph' }],
      reports: [
        {
          impact: 'lossy',
          message: 'Plate HTML decode has no mapping for <img>.',
        },
      ],
    });
  });

  it('reports what it lost when nothing is insertable, then delegates', () => {
    expect(
      decode(
        createEditor(),
        '<meta charset="utf-8"><video src="https://example.com/a.mp4"></video>',
        'https://example.com/a.mp4'
      )
    ).toEqual({
      content: null,
      reports: [
        {
          impact: 'lossless',
          message: 'Removed unsafe HTML element <meta>.',
        },
        {
          impact: 'lossy',
          message: 'Plate HTML decode has no mapping for <video>.',
        },
      ],
    });
  });

  it('delegates without reports when the HTML only repeats the plain text', () => {
    expect(decode(createEditor(), 'Plain words', 'Plain words')).toEqual({
      content: null,
      reports: [],
    });
  });
});
