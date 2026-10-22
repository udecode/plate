import { describe, expect, it } from 'bun:test';
import { crc32, deflateSync } from 'node:zlib';

import JSZip from 'jszip';
import { createEditor, type Value } from 'platejs';
import { exportDocx } from 'platejs/docx/export';

import { DOCX_EXPORT_STYLES } from './docx-export';
import { EditorStatic } from './editor-static';
import { BaseEditorKit } from './plugins-static';

const exportXml = async (
  initialValue: Value,
  stylesheet: string,
  lossPolicy?: 'allow'
) => {
  const editor = createEditor({ initialValue, plugins: BaseEditorKit });
  const result = await exportDocx(editor, {
    component: EditorStatic,
    lossPolicy,
    presentation: BaseEditorKit,
    projection: 'proposed',
    stylesheet,
  });

  if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
  const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());

  return zip.file('word/document.xml')!.async('string');
};

describe('DOCX_EXPORT_STYLES', () => {
  it('lets the app stylesheet restyle a code block', async () => {
    const xml = await exportXml(
      [{ children: [{ text: 'CODE' }], type: 'codeBlock' }] as Value,
      `${DOCX_EXPORT_STYLES}
.editor-codeBlock > [data-docx-preserve-whitespace] {
  background-color: #123456;
  font-family: Arial;
  font-size: 14pt;
}`
    );

    expect(xml).toMatch(/w:fill="123456"/i);
    expect(xml).toContain('w:ascii="Arial"');
    expect(xml).toContain('<w:sz w:val="28"/>');
  });

  it('gives callout cells the default background', async () => {
    const xml = await exportXml(
      [{ children: [{ text: 'Note' }], icon: '💡', type: 'callout' }] as Value,
      DOCX_EXPORT_STYLES
    );

    expect(xml.match(/w:fill="f4f4f5"/gi)).toHaveLength(2);
  });
});

const wideImage = (width: number) => {
  const chunk = (type: string, data: Buffer) => {
    const body = Buffer.concat([Buffer.from(type), data]);
    const length = Buffer.alloc(4);
    const checksum = Buffer.alloc(4);

    length.writeUInt32BE(data.length);
    checksum.writeUInt32BE(crc32(body));

    return Buffer.concat([length, body, checksum]);
  };
  const header = Buffer.alloc(13);

  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(1, 4);
  header.set([8, 0, 0, 0, 0], 8);

  return `data:image/png;base64,${Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(Buffer.alloc(width + 1))),
    chunk('IEND', Buffer.alloc(0)),
  ]).toString('base64')}`;
};

const table = (...rows: Value[][]) => ({
  children: rows.map((cells) => ({
    children: cells.map((children) => ({ children, type: 'tableCell' })),
    type: 'tableRow',
  })),
  type: 'table',
});

const firstCell = (xml: string) =>
  xml.slice(xml.indexOf('<w:tc>'), xml.lastIndexOf('</w:tc>'));

const listed = (
  text: string,
  listType: 'numbered' | 'task',
  properties: Record<string, unknown> = {}
) => ({
  children: [{ text }],
  indent: 1,
  listId: listType,
  listType,
  type: 'paragraph',
  ...properties,
});

describe('DOCX export of listed paragraphs', () => {
  it.each(['numbered', 'task'] as const)(
    'keeps the alignment and line height of a %s paragraph',
    async (listType) => {
      const xml = await exportXml(
        [listed('Listed', listType, { lineHeight: 1.75, textAlign: 'end' })],
        DOCX_EXPORT_STYLES
      );
      const paragraph = [...xml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)]
        .map(([match]) => match)
        .find((match) => match.includes('>Listed</w:t>'));

      expect(paragraph).toContain('<w:numPr>');
      expect(paragraph).toContain('<w:jc w:val="right"/>');
      expect(paragraph).toContain('w:line="420"');
    }
  );
});

const widthOf = (xml: string) =>
  Number(/<wp:extent cx="(\d+)"/.exec(xml)?.[1] ?? Number.NaN);

describe('DOCX export of table cells', () => {
  it.each([
    [
      'a numbered item',
      {
        children: [{ text: 'CELL' }],
        indent: 1,
        listId: 'L',
        listType: 'numbered',
        type: 'paragraph',
      },
      [/CELL/, /<w:numPr>/],
    ],
    [
      'a task',
      {
        checked: true,
        children: [{ text: 'CELL' }],
        indent: 1,
        listId: 'T',
        listType: 'task',
        type: 'paragraph',
      },
      [/CELL/, /<w:numPr>/],
    ],
    [
      'a code block',
      { children: [{ text: 'CELL' }], type: 'codeBlock' },
      [/CELL/],
    ],
    [
      'an equation',
      { children: [{ text: '' }], latex: 'x=1', type: 'equation' },
      [/<m:oMath/],
    ],
    [
      'an image',
      { children: [{ text: '' }], type: 'image', url: wideImage(4) },
      [/<w:drawing/],
    ],
    [
      'a heading',
      { children: [{ text: 'CELL' }], level: 2, type: 'heading' },
      [/CELL/, /<w:pPr>\s*<w:pStyle w:val="Heading2"\/>/, /<w:bookmarkStart/],
    ],
    [
      'a callout',
      { children: [{ text: 'CELL' }], icon: '💡', type: 'callout' },
      [/<w:tbl>[\s\S]*CELL/],
    ],
  ] as const)('keeps %s inside a table cell', async (_, block, patterns) => {
    const cell = firstCell(
      await exportXml([table([[block]])] as Value, DOCX_EXPORT_STYLES)
    );

    for (const pattern of patterns) expect(cell).toMatch(pattern);
  });

  it("gives a numbered paragraph the cell's alignment and line height", async () => {
    const cell = firstCell(
      await exportXml(
        [table([[listed('CELL', 'numbered')]])] as Value,
        `${DOCX_EXPORT_STYLES}
td { line-height: 2; text-align: center; }`
      )
    );

    expect(cell).toContain('<w:numPr>');
    expect(cell).toContain('<w:jc w:val="center"/>');
    expect(cell).toContain('w:line="480"');
  });

  it('numbers a list before, inside and after a table cell as one list', async () => {
    const item = (text: string) => ({
      children: [{ text }],
      indent: 1,
      listId: 'L',
      listType: 'numbered',
      type: 'paragraph',
    });
    const xml = await exportXml(
      [item('A'), table([[item('B')]]), item('C')] as Value,
      DOCX_EXPORT_STYLES
    );
    const numIds = [...xml.matchAll(/<w:numId w:val="(\d+)"\/>/g)].map(
      ([, id]) => id
    );

    expect(numIds).toEqual([numIds[0], numIds[0], numIds[0]]);
  });

  it('sizes an image in a nested table to the cell that holds it', async () => {
    const image = {
      children: [{ text: '' }],
      type: 'image',
      url: wideImage(3000),
    };
    const pageWidth = widthOf(
      await exportXml([image] as Value, DOCX_EXPORT_STYLES)
    );
    const nested = widthOf(
      await exportXml(
        [
          table([
            [table([[image]])],
            [{ children: [{ text: 'Right' }], type: 'paragraph' }],
          ]),
        ] as Value,
        DOCX_EXPORT_STYLES
      )
    );

    expect(nested).toBeLessThanOrEqual(pageWidth / 2);
  });

  it('keeps two tables in one cell apart with a paragraph', async () => {
    const paragraph = (text: string) => ({
      children: [{ text }],
      type: 'paragraph',
    });
    const xml = await exportXml(
      [
        table([
          [table([[paragraph('first')]]), table([[paragraph('second')]])],
        ]),
      ] as Value,
      DOCX_EXPORT_STYLES
    );

    expect(firstCell(xml)).toMatch(
      /first[\s\S]*?<\/w:tbl>\s*<w:p[\s/>][\s\S]*?<w:tbl>[\s\S]*?second/
    );
  });

  it('ends a table cell whose only image cannot be embedded with a paragraph', async () => {
    const xml = await exportXml(
      [
        table([
          [
            {
              children: [{ text: '' }],
              type: 'image',
              url: 'https://example.com/remote.png',
            },
          ],
        ]),
      ] as Value,
      DOCX_EXPORT_STYLES,
      'allow'
    );

    expect(firstCell(xml)).toMatch(/(<\/w:p>|<w:p\/>)\s*$/);
  });
});
