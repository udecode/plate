import JSZip from 'jszip';
import React from 'react';

import { createEditor, type Value } from '../../../core';
import { BaseCodeBlockPlugin } from '../../../features/code-block/lib/BaseCodeBlockPlugin';
import { BaseIndentPlugin } from '../../../features/indent';
import { BaseListPlugin } from '../../../features/list';
import { BaseParagraphPlugin } from '../../../lib';
import { exportDocx } from './exportDocx';

const exportListPackage = async (initialValue: Value) => {
  const editor = createEditor({
    plugins: [
      BaseParagraphPlugin,
      BaseCodeBlockPlugin,
      BaseIndentPlugin.configure({
        initialState: { offset: 24 },
        targetPlugins: ['paragraph', 'codeBlock'],
      }),
      BaseListPlugin.configure({
        slots: {
          wrapNodeChildren: ({ element }) =>
            element.listType === 'task'
              ? ({ children }) => (
                  <ul>
                    <li data-checked={String(element.checked === true)}>
                      <button type="button">mark</button>
                      {children}
                    </li>
                  </ul>
                )
              : element.listType === 'bulleted'
                ? ({ children }) => (
                    <ul>
                      <li>{children}</li>
                    </ul>
                  )
                : element.listType
                  ? ({ children }) => (
                      <ol>
                        <li>{children}</li>
                      </ol>
                    )
                  : undefined,
        },
        targetPlugins: ['paragraph', 'codeBlock'],
      }),
    ],
    initialValue,
  });
  const result = await exportDocx(editor, { projection: 'proposed' });

  if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
  const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());

  return {
    documentXml: await zip.file('word/document.xml')!.async('string'),
    numberingXml: (await zip.file('word/numbering.xml')?.async('string')) ?? '',
  };
};

const listLevels = async (initialValue: Value) => {
  const { documentXml } = await exportListPackage(initialValue);

  return [...documentXml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)].flatMap(
    ([paragraph]) => {
      const text = [...paragraph.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)]
        .map(([, run]) => run)
        .join('');

      return text
        ? [[text, paragraph.match(/<w:ilvl w:val="(\d+)"/)?.[1]]]
        : [];
    }
  );
};

const numbered = (indent: number, text: string) => ({
  children: [{ text }],
  indent,
  listType: 'numbered',
  type: 'paragraph',
});

const numberingIds = async (initialValue: Value) => {
  const { documentXml, numberingXml } = await exportListPackage(initialValue);
  const defined = new Set(
    [...numberingXml.matchAll(/<w:num w:numId="(\d+)"/g)].map(([, id]) => id)
  );
  const used = [...documentXml.matchAll(/<w:numId w:val="(\d+)"/g)].map(
    ([, id]) => id
  );

  return { undefined: used.filter((id) => !defined.has(id)), used };
};

const task = (indent: number, text: string, checked: boolean) => ({
  checked,
  children: [{ text }],
  indent,
  listType: 'task',
  type: 'paragraph',
});

describe('exportDocx lists', () => {
  it('draws task items with a checkbox marker at their list level', async () => {
    const { documentXml, numberingXml } = await exportListPackage([
      task(1, 'Done task', true),
      task(2, 'Open task', false),
    ] as Value);
    const paragraphs = [...documentXml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)]
      .map(([paragraph]) => paragraph)
      .filter((paragraph) => paragraph.includes('<w:numPr>'));
    const marker = (paragraph: string) => {
      const numId = paragraph.match(/<w:numId w:val="(\d+)"/)?.[1];
      const level = paragraph.match(/<w:ilvl w:val="(\d+)"/)?.[1];
      const abstract = numberingXml.match(
        new RegExp(
          `<w:abstractNum w:abstractNumId="${numId}"[\\s\\S]*?<\\/w:abstractNum>`
        )
      )?.[0];
      const levelXml = abstract?.match(
        new RegExp(`<w:lvl w:ilvl="${level}"[\\s\\S]*?<\\/w:lvl>`)
      )?.[0];

      return {
        font: levelXml?.match(/<w:rFonts w:ascii="([^"]+)"/)?.[1],
        level,
        text: levelXml?.match(/<w:lvlText w:val="([^"]*)"/)?.[1],
      };
    };

    expect(paragraphs.map(marker)).toEqual([
      { font: 'Segoe UI Symbol', level: '0', text: '☑' },
      { font: 'Segoe UI Symbol', level: '1', text: '☐' },
    ]);
  });

  it('gives concurrent exports the list numbering each gets alone', async () => {
    const first = [
      numbered(1, 'one'),
      numbered(1, 'two'),
      numbered(2, 'nested'),
      { children: [{ text: 'between' }], type: 'paragraph' },
      numbered(1, 'three'),
    ] as Value;
    const second = [
      { ...numbered(1, 'bullet'), listType: 'bulleted' },
      numbered(2, 'nested number'),
      numbered(1, 'number'),
    ] as Value;
    const alone = [await numberingIds(first), await numberingIds(second)];

    expect(
      await Promise.all([numberingIds(first), numberingIds(second)])
    ).toEqual(alone);
    expect(alone.flatMap((ids) => ids.undefined)).toEqual([]);
  });

  it('takes Word list levels from the indent of the block a list wraps', async () => {
    const levels = await Promise.all([
      listLevels([
        numbered(1, 'one'),
        numbered(2, 'two'),
        numbered(3, 'three'),
      ]),
      listLevels([
        numbered(1, 'before'),
        {
          children: [{ text: 'code' }],
          indent: 2,
          listType: 'numbered',
          type: 'codeBlock',
        },
      ]),
    ]);

    expect(levels).toEqual([
      [
        ['one', '0'],
        ['two', '1'],
        ['three', '2'],
      ],
      [
        ['before', '0'],
        ['code', '1'],
      ],
    ]);
  });
});
