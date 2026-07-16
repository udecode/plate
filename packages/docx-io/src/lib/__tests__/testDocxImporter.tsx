/** @jsx jsx */

import fs from 'node:fs';
import path from 'node:path';

import {
  BaseBasicBlocksPlugin,
  BaseBasicMarksPlugin,
} from '@platejs/basic-nodes';
import { cleanDocx } from '@platejs/docx';
import type { BasePlugin, BasePlugins } from '@platejs/core';
import {
  createBaseEditor,
  createBasePlugin,
  deserializeHtml,
} from '@platejs/core';
import { jsx, type TestEditor } from '@platejs/test-utils';
import { KEYS } from '@platejs/utils';
import mammoth from 'mammoth';

import { preprocessMammothHtml } from '../preprocessMammothHtml';

// biome-ignore lint/suspicious/noUnusedExpressions: test
jsx;

const TestLinkPlugin = createBasePlugin({
  key: KEYS.link,
  node: { isElement: true, isInline: true },
  parsers: {
    html: {
      deserializer: {
        parse: ({ element, type }) => {
          const url = element.getAttribute('href');

          if (!url) return;

          return {
            target: element.getAttribute('target') || '_blank',
            type,
            url,
          };
        },
        rules: [{ validNodeName: 'A' }],
      },
    },
  },
});

const TestTableRowPlugin = createBasePlugin({
  key: KEYS.tr,
  node: { isContainer: true, isElement: true, isStrictSiblings: true },
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'TR' }] } } },
});

const TestTableCellPlugin = createBasePlugin({
  key: KEYS.td,
  node: { isContainer: true, isElement: true, isStrictSiblings: true },
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'TD' }] } } },
});

const TestTablePlugin = createBasePlugin({
  key: KEYS.table,
  node: { isContainer: true, isElement: true },
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'TABLE' }] } } },
  plugins: [TestTableRowPlugin, TestTableCellPlugin],
});

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
  expected: TestEditor;
  filename: string;
  overridePlugins?: BasePlugin['override']['plugins'];
  plugins?: BasePlugins;
}) => {
  it('import', async () => {
    const editor = createBaseEditor({
      override: {
        plugins: overridePlugins,
      },
      plugins: [
        ...plugins,
        BaseBasicBlocksPlugin,
        BaseBasicMarksPlugin,
        TestLinkPlugin,
        TestTablePlugin,
      ],
    });

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
    const nodes = deserializeHtml(editor, { element: doc.body });

    expect(nodes).toEqual(expected.children);
  });
};
