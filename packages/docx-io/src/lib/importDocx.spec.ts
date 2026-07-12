import { afterAll, afterEach, describe, expect, it, mock } from 'bun:test';
import { createBaseEditor } from 'platejs';

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

const loadModule = async () =>
  import(`./importDocx?test=${Math.random().toString(36).slice(2)}`);

describe('importDocx', () => {
  afterEach(() => {
    cleanDocxMock.mockReset();
    convertToHtmlMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('converts mammoth html, cleans it, deserializes nodes, and returns warnings', async () => {
    const { importDocx } = await loadModule();
    const editor = createBaseEditor();

    convertToHtmlMock.mockImplementation(async () => ({
      messages: [{ message: 'warn-1' }],
      value: '<p>Hello</p>',
    }));

    const result = await importDocx(editor, new ArrayBuffer(8), {
      rtf: '{\\\\rtf1}',
    });

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
});
