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
    cleanDocxMock.mockReset();
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

    const result = await editor
      .plugin(DocxIOPlugin)
      .api.import(new ArrayBuffer(8), { rtf: '{\\\\rtf1}' });

    expect(convertToHtmlMock).toHaveBeenCalledWith(
      { arrayBuffer: expect.any(ArrayBuffer) },
      { styleMap: ['comment-reference => sup'] }
    );
    expect(cleanDocxMock).toHaveBeenCalledWith('<p>Hello</p>', '{\\\\rtf1}');
    expect(result).toEqual({
      comments: [],
      nodes: [{ type: 'p', children: [{ text: 'Hello' }] }],
      warnings: ['warn-1'],
    });
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
