import JSZip from 'jszip';
import React from 'react';

import { createEditor, type Value } from '../../../core';
import { BaseCodeBlockPlugin } from '../../../features/code-block/lib/BaseCodeBlockPlugin';
import { BaseIndentPlugin } from '../../../features/indent';
import { BaseListPlugin } from '../../../features/list';
import { BaseParagraphPlugin } from '../../../lib';
import { exportDocx } from './exportDocx';

const listLevels = async (initialValue: Value) => {
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
            element.listType
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

  if (!result.ok) return result.diagnostics;
  const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
  const documentXml = await zip.file('word/document.xml')!.async('string');

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

describe('exportDocx lists', () => {
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
