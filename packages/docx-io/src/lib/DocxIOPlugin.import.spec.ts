import {
  afterAll,
  afterEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test';
import { createBaseEditor } from '@platejs/core';

const cleanDocxMock = mock((html: string) => html);
const convertToHtmlMock = mock();

mock.module('@platejs/docx', () => ({
  cleanDocx: cleanDocxMock,
}));

mock.module('mammoth', () => ({
  default: {
    convertToHtml: convertToHtmlMock,
  },
}));

const loadModule = async () => import('./DocxIOPlugin');

describe('DocxIOPlugin import', () => {
  afterEach(() => {
    cleanDocxMock.mockClear();
    convertToHtmlMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('converts mammoth html, cleans it, deserializes nodes, and returns warnings', async () => {
    const { DocxIOPlugin } = await loadModule();
    const editor = createBaseEditor({ plugins: [DocxIOPlugin] });

    convertToHtmlMock.mockImplementation(async () => ({
      messages: [{ message: 'warn-1' }],
      value: '<p>Hello</p>',
    }));
    const arrayBuffer = new ArrayBuffer(8);

    const result = await editor
      .plugin(DocxIOPlugin)
      .api.import(arrayBuffer, { rtf: '{\\\\rtf1}' });

    expect(convertToHtmlMock).toHaveBeenCalledWith(
      { arrayBuffer, buffer: arrayBuffer },
      { styleMap: ['comment-reference => sup'] }
    );
    expect(cleanDocxMock).toHaveBeenCalledWith('<p>Hello</p>', '{\\\\rtf1}');
    expect(result).toEqual({
      comments: [],
      nodes: [{ type: 'p', children: [{ text: 'Hello' }] }],
      warnings: ['warn-1'],
    });
  });

  it('returns comment references without leaking import markers into nodes', async () => {
    const { DocxIOPlugin } = await loadModule();
    const editor = createBaseEditor({ plugins: [DocxIOPlugin] });

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
      .plugin(DocxIOPlugin)
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
      nodes: [{ type: 'p', children: [{ text: 'AlphaBeta' }] }],
      warnings: [],
    });
    expect(JSON.stringify(result.nodes)).not.toContain('DOCX_COMMENT_REF');
  });

  it('reports HTML decode rejection instead of silently succeeding', async () => {
    const { DocxIOPlugin } = await loadModule();
    const editor = createBaseEditor({ plugins: [DocxIOPlugin] });

    convertToHtmlMock.mockImplementation(async () => ({
      messages: [{ message: 'warn-1' }],
      value: '<p>Hello</p>',
    }));
    spyOn(editor.api.html, 'deserialize').mockReturnValue(null);

    expect(
      await editor.plugin(DocxIOPlugin).api.import(new ArrayBuffer(8))
    ).toEqual({
      comments: [],
      nodes: [],
      warnings: ['warn-1', 'Failed to decode HTML'],
    });
  });
});
