/** @jsx jsx */

import fs from 'node:fs';
import path from 'node:path';

import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseH5Plugin,
  BaseH6Plugin,
  BaseHorizontalRulePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin,
} from '@platejs/basic-nodes';
import { BaseTextAlignPlugin } from '@platejs/basic-styles';
import { cleanDocx } from '@platejs/docx';
import { BaseLinkPlugin } from '@platejs/link';
import { BaseListPlugin } from '@platejs/list';
import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';
import { jsx } from '@platejs/test-utils';
import type { SlatePlugin, TNode } from 'platejs';
import { BaseParagraphPlugin, createSlateEditor } from 'platejs';

import { mammoth, preprocessMammothHtml } from '../importDocx';

// biome-ignore lint/nursery/noUnusedExpressions: test
jsx;

/** Read .docx file from docx package's __tests__ directory */
export const readDocxFixture = (filename: string): Buffer => {
  const docxTestDir = path.resolve(
    __dirname,
    '../../../../docx/src/lib/__tests__'
  );
  const filepath = path.join(docxTestDir, `${filename}.docx`);

  return fs.readFileSync(filepath);
};

export const getDocxTestName = (name: string) => `when importing docx ${name}`;

export const testDocxImporter = ({
  expected,
  filename,
  overridePlugins,
  plugins = [],
}: {
  expected: any;
  filename: string;
  overridePlugins?: SlatePlugin['override']['plugins'];
  plugins?: any[];
}) => {
  it('should import', async () => {
    const editor = createSlateEditor({
      override: {
        plugins: overridePlugins,
      },
      plugins: [
        ...plugins,
        BaseParagraphPlugin,
        BaseH1Plugin,
        BaseH2Plugin,
        BaseH3Plugin,
        BaseH4Plugin,
        BaseH5Plugin,
        BaseH6Plugin,
        BaseBlockquotePlugin,
        BaseHorizontalRulePlugin,
        BaseBoldPlugin,
        BaseItalicPlugin,
        BaseUnderlinePlugin,
        BaseCodePlugin,
        BaseStrikethroughPlugin,
        BaseSubscriptPlugin,
        BaseSuperscriptPlugin,
        BaseLinkPlugin,
        BaseListPlugin,
        BaseTablePlugin,
        BaseTableRowPlugin,
        BaseTableCellPlugin,
        BaseTableCellHeaderPlugin,
        BaseTextAlignPlugin,
      ],
    });

    // Read docx file as Node Buffer
    const buffer = readDocxFixture(filename);

    // Convert Node Buffer to ArrayBuffer for mammoth
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer;

    // Use mammoth with arrayBuffer option
    const mammothResult = await mammoth.convertToHtml(
      { arrayBuffer },
      { styleMap: ['comment-reference => sup'] }
    );

    // Process HTML same as importDocx
    const { html: preprocessedHtml } = preprocessMammothHtml(
      mammothResult.value
    );
    const cleanedHtml = cleanDocx(preprocessedHtml, '');

    // Deserialize HTML to nodes
    const doc = new DOMParser().parseFromString(cleanedHtml, 'text/html');
    const nodes = editor.api.html.deserialize({ element: doc.body }) as TNode[];

    expect(nodes).toEqual(expected.children);
  });
};
