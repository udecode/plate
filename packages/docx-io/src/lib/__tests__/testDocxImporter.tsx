/** @jsx jsx */

import fs from 'node:fs';
import path from 'node:path';

import {
  BaseBasicBlocksPlugin,
  BaseBasicMarksPlugin,
} from '@platejs/basic-nodes';
import { BaseHorizontalRulePlugin } from '@platejs/basic-nodes';
import {
  BaseLineHeightPlugin,
  BaseTextAlignPlugin,
} from '@platejs/basic-styles';
import { BaseCodeBlockPlugin } from '@platejs/code-block';
import { cleanDocx } from '@platejs/docx';
import { BaseIndentPlugin } from '@platejs/indent';
import { BaseLinkPlugin } from '@platejs/link';
import { BaseListPlugin } from '@platejs/list';
import { BaseImagePlugin } from '@platejs/media';
import type { Descendant, SlatePlugin } from 'platejs';
import { createSlateEditor } from 'platejs';
import { BaseTablePlugin } from '@platejs/table';
import { jsx } from '@platejs/test-utils';
import mammoth from 'mammoth';

import { preprocessMammothHtml } from '../preprocessMammothHtml';

// biome-ignore lint/nursery/noUnusedExpressions: test
jsx;

const injectConfig = {
  inject: {
    targetPlugins: ['p', 'h1', 'h2', 'h3'],
  },
};

/** Read .docx file from docx package's __tests__ directory */
export const readDocxFixture = (filename: string): Buffer => {
  const docxTestDir = path.resolve(
    __dirname,
    '../../../../../apps/www/src/__tests__/package-integration/docx'
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
  it('import', async () => {
    const editor = createSlateEditor({
      override: {
        plugins: overridePlugins,
      },
      plugins: [
        ...plugins,
        BaseImagePlugin,
        BaseHorizontalRulePlugin,
        BaseCodeBlockPlugin,
        BaseLinkPlugin,
        BaseBasicBlocksPlugin,
        BaseBasicMarksPlugin,
        BaseListPlugin,
        BaseTablePlugin,
        BaseLineHeightPlugin.extend(() => injectConfig),
        BaseTextAlignPlugin.extend(() => injectConfig),
        BaseIndentPlugin.extend(() => injectConfig),
      ],
    } as any);

    // Read docx file as Node Buffer
    const buffer = readDocxFixture(filename);

    // Use mammoth with buffer option (Node.js compatible)
    const mammothResult = await mammoth.convertToHtml(
      { buffer },
      { styleMap: ['comment-reference => sup'] }
    );

    // Process HTML same as importDocx
    const { html: preprocessedHtml } = preprocessMammothHtml(
      mammothResult.value
    );
    const cleanedHtml = cleanDocx(preprocessedHtml, '');

    // Deserialize HTML to nodes
    const doc = new DOMParser().parseFromString(cleanedHtml, 'text/html');
    const nodes = editor.api.html.deserialize({
      element: doc.body,
    }) as Descendant[];

    expect(nodes).toEqual(expected.children);
  });
};
