/** @jsx jsx */

import fs from 'node:fs';
import path from 'node:path';

import { cleanDocx } from '@platejs/docx';
import type { SlatePlugin, TNode } from 'platejs';
import { createSlateEditor } from 'platejs';
import { TextAlignPlugin } from '@platejs/basic-styles/react';
import {
  BasicBlocksPlugin,
  BasicMarksPlugin,
} from '@platejs/basic-nodes/react';
import { HorizontalRulePlugin } from '@platejs/basic-nodes/react';
import { CodeBlockPlugin } from '@platejs/code-block/react';
import { IndentPlugin } from '@platejs/indent/react';
import { LineHeightPlugin } from '@platejs/basic-styles/react';
import { LinkPlugin } from '@platejs/link/react';
import { ListPlugin } from '@platejs/list/react';
import { ImagePlugin } from '@platejs/media/react';
import { TablePlugin } from '@platejs/table/react';
import { jsx } from '@platejs/test-utils';
import { mammoth, preprocessMammothHtml } from '../importDocx';

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
        ImagePlugin,
        HorizontalRulePlugin,
        CodeBlockPlugin,
        LinkPlugin,
        BasicBlocksPlugin,
        BasicMarksPlugin,
        ListPlugin,
        TablePlugin,
        LineHeightPlugin.extend(() => injectConfig),
        TextAlignPlugin.extend(() => injectConfig),
        IndentPlugin.extend(() => injectConfig),
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
