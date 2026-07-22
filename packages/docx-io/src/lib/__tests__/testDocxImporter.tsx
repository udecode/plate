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
  BaseParagraphPlugin,
  HtmlPlugin,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import { property, schema } from '@platejs/plite';
import { jsx, type TestEditor } from '@platejs/test-utils';
import { KEYS } from '@platejs/utils';
import mammoth from 'mammoth';

import { preprocessMammothHtml } from '../preprocessMammothHtml';

// biome-ignore lint/suspicious/noUnusedExpressions: test
jsx;

const TestLinkPlugin = createBasePlugin({
  key: KEYS.link,
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
      properties: {
        target: property.string(),
        url: property.string(),
      },
    },
  },
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
  schema: ({ plugins }) => {
    const cellType = plugins.elementType(TestTableCellPlugin);

    return {
      element: {
        content: schema.content.type(cellType, {
          default: { type: cellType },
          min: 1,
        }),
      },
    };
  },
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'TR' }] } } },
});

const TestTableCellPlugin = createBasePlugin({
  key: KEYS.td,
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: { type: plugins.elementType(BaseParagraphPlugin) },
        min: 1,
      }),
    },
  }),
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'TD' }] } } },
});

const TestTablePlugin = createBasePlugin({
  key: KEYS.table,
  schema: ({ plugins }) => {
    const rowType = plugins.elementType(TestTableRowPlugin);

    return {
      element: {
        content: schema.content.type(rowType, {
          default: { type: rowType },
          min: 1,
        }),
      },
    };
  },
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
    const nodes = editor.plugin(HtmlPlugin).api.deserialize({
      element: doc.body,
    });

    expect(nodes).toEqual(expected.children);
  });
};
