import JSZip from 'jszip';

import { createEditor } from '../../../core';
import * as docx from '../../html/cleanWordHtml.internal';

const convertToHtmlMock = mock();
let restoreCleanWordHtmlSpy: (() => void) | undefined;

void mock.module('mammoth', () => ({
  default: {
    convertToHtml: convertToHtmlMock,
  },
}));

const loadModule = async () => import('./importDocx');
const WORD_NAMESPACE =
  'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

const createDocx = async (
  documentXml = `<w:document xmlns:w="${WORD_NAMESPACE}"><w:body><w:p><w:r><w:t>Hello</w:t></w:r></w:p></w:body></w:document>`,
  parts: Readonly<Record<string, string>> = {}
) => {
  const zip = new JSZip();

  zip.file('word/document.xml', documentXml);
  for (const [name, value] of Object.entries(parts)) zip.file(name, value);

  return zip.generateAsync({ type: 'arraybuffer' });
};

describe('importDocx', () => {
  afterEach(() => {
    restoreCleanWordHtmlSpy?.();
    restoreCleanWordHtmlSpy = undefined;
    convertToHtmlMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('converts one bounded package without mutating the editor', async () => {
    const cleanWordHtmlSpy = spyOn(docx, 'cleanWordHtml');
    restoreCleanWordHtmlSpy = () => cleanWordHtmlSpy.mockRestore();
    const { importDocx } = await loadModule();
    const editor = createEditor();

    convertToHtmlMock.mockImplementation(async () => ({
      messages: [{ message: 'warn-1' }],
      value: '<p><span class="MsoFootnoteReference">[4]</span>Hello</p>',
    }));
    const value = editor.read.value();
    const result = await importDocx(editor, await createDocx());

    expect(editor.read.value()).toEqual(value);
    expect(convertToHtmlMock).toHaveBeenCalledTimes(1);
    const mammothInput = convertToHtmlMock.mock.calls[0][0];

    expect(mammothInput.arrayBuffer).toBeInstanceOf(ArrayBuffer);
    expect(mammothInput.buffer).toBe(mammothInput.arrayBuffer);
    expect(convertToHtmlMock.mock.calls[0][1]).toEqual({
      styleMap: ['comment-reference => sup'],
    });
    expect(cleanWordHtmlSpy).toHaveBeenCalledWith(
      '<p><span class="MsoFootnoteReference">[4]</span>Hello</p>',
      ''
    );
    expect(result).toEqual({
      comments: [],
      diagnostics: [
        {
          code: 'converter-message',
          message: 'warn-1',
          severity: 'warning',
        },
      ],
      document: {
        children: [{ children: [{ text: '4Hello' }], type: 'paragraph' }],
      },
      ok: true,
    });
  });

  it('retains source only when requested and releases it idempotently', async () => {
    const { importDocx } = await loadModule();
    const editor = createEditor();

    convertToHtmlMock.mockImplementation(async () => ({
      messages: [],
      value: '<p>Hello</p>',
    }));
    const source = await createDocx();
    const ordinary = await importDocx(editor, source);
    const retained = await importDocx(editor, source, { retainSource: true });

    expect(ordinary.ok).toBe(true);
    expect('source' in ordinary).toBe(false);
    expect(retained.ok).toBe(true);
    if (!retained.ok) return;
    expect(retained.source).toEqual(
      expect.objectContaining({ dispose: expect.any(Function) })
    );
    expect(() => {
      retained.source.dispose();
      retained.source.dispose();
    }).not.toThrow();
  });

  it('returns rich comment records and strips private range markers', async () => {
    const { importDocx } = await loadModule();
    const editor = createEditor();
    const documentXml = [
      `<w:document xmlns:w="${WORD_NAMESPACE}"><w:body><w:p>`,
      '<w:r><w:t>Alpha</w:t></w:r>',
      '<w:commentRangeStart w:id="1"/>',
      '<w:r><w:t>Beta</w:t></w:r>',
      '<w:commentRangeEnd w:id="1"/>',
      '</w:p></w:body></w:document>',
    ].join('');
    const commentsXml = [
      `<w:comments xmlns:w="${WORD_NAMESPACE}">`,
      '<w:comment w:id="1" w:author="Ada Lovelace" w:initials="AL" w:date="2026-09-15T10:00:00Z">',
      '<w:p><w:r><w:t>First note</w:t></w:r></w:p>',
      '</w:comment></w:comments>',
    ].join('');

    convertToHtmlMock.mockImplementation(async ({ arrayBuffer }) => {
      const zip = await JSZip.loadAsync(arrayBuffer);
      const instrumented = await zip.file('word/document.xml')!.async('string');
      const markers = instrumented.match(/\uE000PDX_[^\uE001]+\uE001/g) ?? [];

      return {
        messages: [],
        value: [
          `<p>Alpha${markers[0]}Beta${markers[1]}</p>`,
          '<dl><dt id="comment-1">Comment 1</dt>',
          '<dd><p>First note</p></dd></dl>',
        ].join(''),
      };
    });

    const result = await importDocx(
      editor,
      await createDocx(documentXml, { 'word/comments.xml': commentsXml })
    );

    expect(result).toEqual({
      comments: [
        {
          author: { initials: 'AL', name: 'Ada Lovelace' },
          body: [{ children: [{ text: 'First note' }], type: 'paragraph' }],
          createdAt: '2026-09-15T10:00:00.000Z',
          durableId: null,
          id: '1',
          parentId: null,
          resolved: null,
          target: {
            range: {
              anchor: { offset: 5, path: [0, 0] },
              focus: { offset: 9, path: [0, 0] },
            },
          },
        },
      ],
      diagnostics: [],
      document: {
        children: [{ children: [{ text: 'AlphaBeta' }], type: 'paragraph' }],
      },
      ok: true,
    });
    expect(JSON.stringify(result)).not.toContain('PDX_');
  });

  it('returns a decode failure when the installed schema rejects HTML', async () => {
    const { importDocx } = await loadModule();
    const editor = createEditor();

    convertToHtmlMock.mockImplementation(async () => ({
      messages: [{ message: 'warn-1' }],
      value: '<p>Hello</p>',
    }));
    spyOn(editor.api.html, 'deserialize').mockReturnValue(null);

    expect(await importDocx(editor, await createDocx())).toEqual({
      diagnostics: [
        {
          code: 'converter-message',
          message: 'warn-1',
          severity: 'warning',
        },
        {
          code: 'decode-failed',
          message:
            'DOCX content could not be decoded by the installed editor schema.',
          part: 'word/document.xml',
          severity: 'error',
        },
      ],
      ok: false,
    });
  });

  it('returns structured package-limit failures', async () => {
    const { importDocx } = await loadModule();
    const editor = createEditor();
    const source = await createDocx();
    const result = await importDocx(editor, source, {
      limits: { maxInputBytes: 1 },
    });

    expect(result).toEqual({
      diagnostics: [
        {
          actual: source.byteLength,
          code: 'limit-exceeded',
          limit: 'maxInputBytes',
          maximum: 1,
          message: 'DOCX exceeds maxInputBytes.',
          severity: 'error',
        },
      ],
      ok: false,
    });
    expect(convertToHtmlMock).not.toHaveBeenCalled();
  });

  it('bounds revision and comment records before conversion', async () => {
    const { importDocx } = await loadModule();
    const editor = createEditor();
    const revisions = [
      `<w:document xmlns:w="${WORD_NAMESPACE}"><w:body><w:p>`,
      '<w:ins w:id="1" w:author="A"><w:r><w:t>A</w:t></w:r></w:ins>',
      '<w:ins w:id="2" w:author="B"><w:r><w:t>B</w:t></w:r></w:ins>',
      '</w:p></w:body></w:document>',
    ].join('');
    const comments = [
      `<w:comments xmlns:w="${WORD_NAMESPACE}">`,
      '<w:comment w:id="1"><w:p><w:r><w:t>A</w:t></w:r></w:p></w:comment>',
      '<w:comment w:id="2"><w:p><w:r><w:t>B</w:t></w:r></w:p></w:comment>',
      '</w:comments>',
    ].join('');
    const revisionResult = await importDocx(
      editor,
      await createDocx(revisions),
      {
        limits: { maxRevisions: 1 },
      }
    );
    const commentResult = await importDocx(
      editor,
      await createDocx(undefined, { 'word/comments.xml': comments }),
      { limits: { maxComments: 1 } }
    );

    expect(revisionResult).toEqual({
      diagnostics: [
        expect.objectContaining({
          code: 'limit-exceeded',
          limit: 'maxRevisions',
        }),
      ],
      ok: false,
    });
    expect(commentResult).toEqual({
      diagnostics: [
        expect.objectContaining({
          code: 'limit-exceeded',
          limit: 'maxComments',
        }),
      ],
      ok: false,
    });
    expect(convertToHtmlMock).not.toHaveBeenCalled();
  });

  it('throws for invalid programmer options', async () => {
    const { importDocx } = await loadModule();

    await expect(
      importDocx(createEditor(), await createDocx(), {
        limits: { maxEntries: 0 },
      })
    ).rejects.toThrow('maxEntries must be a positive safe integer.');
  });
});
