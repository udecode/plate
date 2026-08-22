import { createBaseEditor } from '@platejs/core';
import * as docx from '@platejs/docx-paste';

const convertToHtmlMock = mock();
let restoreCleanWordHtmlSpy: (() => void) | undefined;

void mock.module('mammoth', () => ({
  default: {
    convertToHtml: convertToHtmlMock,
  },
}));

const loadModule = async () => import('./DocxImportPlugin');

describe('DocxImportPlugin import', () => {
  afterEach(() => {
    restoreCleanWordHtmlSpy?.();
    restoreCleanWordHtmlSpy = undefined;
    convertToHtmlMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('converts mammoth html, cleans it, deserializes nodes, and returns warnings', async () => {
    const cleanWordHtmlSpy = spyOn(docx, 'cleanWordHtml');
    restoreCleanWordHtmlSpy = () => cleanWordHtmlSpy.mockRestore();
    const { DocxImportPlugin } = await loadModule();
    const editor = createBaseEditor({ plugins: [DocxImportPlugin] });

    convertToHtmlMock.mockImplementation(async () => ({
      messages: [{ message: 'warn-1' }],
      value: '<p><span class="MsoFootnoteReference">[4]</span>Hello</p>',
    }));
    const arrayBuffer = new ArrayBuffer(8);

    const result = await editor
      .plugin(DocxImportPlugin)
      .api.import(arrayBuffer, { rtf: '{\\\\rtf1}' });

    expect(convertToHtmlMock).toHaveBeenCalledWith(
      { arrayBuffer, buffer: arrayBuffer },
      { styleMap: ['comment-reference => sup'] }
    );
    expect(cleanWordHtmlSpy).toHaveBeenCalledWith(
      '<p><span class="MsoFootnoteReference">[4]</span>Hello</p>',
      '{\\\\rtf1}'
    );
    expect(result).toEqual({
      comments: [],
      nodes: [{ type: 'paragraph', children: [{ text: '4Hello' }] }],
      warnings: ['warn-1'],
    });
  });

  it('returns comment references without leaking import markers into nodes', async () => {
    const { DocxImportPlugin } = await loadModule();
    const editor = createBaseEditor({ plugins: [DocxImportPlugin] });

    convertToHtmlMock.mockImplementation(async () => ({
      messages: [],
      value: [
        '<p>Alpha<a id="comment-ref-1" href="#comment-1">[1]</a>',
        'Beta<a id="comment-ref-1" href="#comment-1">[1]</a></p>',
        '<dl><dt id="comment-1">Comment 1</dt>',
        '<dd><p>First note</p><p>more detail ',
        '<a href="#comment-ref-1">↑</a></p></dd></dl>',
      ].join(''),
    }));

    const result = await editor
      .plugin(DocxImportPlugin)
      .api.import(new ArrayBuffer(8));

    expect(result).toEqual({
      comments: [
        {
          id: '1',
          references: [
            { offset: 5, path: [0, 0] },
            { offset: 9, path: [0, 0] },
          ],
          text: 'First note more detail',
        },
      ],
      nodes: [{ type: 'paragraph', children: [{ text: 'AlphaBeta' }] }],
      warnings: [],
    });
    expect(JSON.stringify(result.nodes)).not.toContain('DOCX_COMMENT_REF');
  });

  it('reports HTML decode rejection instead of silently succeeding', async () => {
    const { DocxImportPlugin } = await loadModule();
    const editor = createBaseEditor({ plugins: [DocxImportPlugin] });

    convertToHtmlMock.mockImplementation(async () => ({
      messages: [{ message: 'warn-1' }],
      value: '<p>Hello</p>',
    }));
    spyOn(editor.api.html, 'deserialize').mockReturnValue(null);

    expect(
      await editor.plugin(DocxImportPlugin).api.import(new ArrayBuffer(8))
    ).toEqual({
      comments: [],
      nodes: [],
      warnings: ['warn-1', 'Failed to decode HTML'],
    });
  });
});
