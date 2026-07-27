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
  BaseScriptPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from '@platejs/basic-nodes';
import { cleanDocx } from '@platejs/docx';
import type { BasePlugins } from '@platejs/core';
import {
  BaseParagraphPlugin,
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
  key: 'link',
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
  type: KEYS.link,
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => {
          const url = element.getAttribute('href');

          if (!url) return;

          return {
            target: element.getAttribute('target') || '_blank',
            url,
          };
        },
        decodeOnly: true,
        match: [{ tag: 'a' }],
      },
    }),
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
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        decodeOnly: true,
        match: [{ tag: 'tr' }],
      },
    }),
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
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        decodeOnly: true,
        match: [{ tag: 'td' }],
      },
    }),
});

const TestTablePlugin = createBasePlugin({
  key: KEYS.table,
  dependencies: [TestTableRowPlugin, TestTableCellPlugin],
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
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        decodeOnly: true,
        match: [{ tag: 'table' }],
      },
    }),
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
  plugins = [],
}: {
  expected: TestEditor;
  filename: string;
  plugins?: BasePlugins;
}) => {
  it('import', async () => {
    const editor = createBaseEditor({
      plugins: [
        ...plugins,
        BaseBlockquotePlugin,
        BaseH1Plugin,
        BaseH2Plugin,
        BaseH3Plugin,
        BaseH4Plugin,
        BaseH5Plugin,
        BaseH6Plugin,
        BaseHorizontalRulePlugin,
        BaseBoldPlugin,
        BaseCodePlugin,
        BaseItalicPlugin,
        BaseStrikethroughPlugin,
        BaseScriptPlugin,
        BaseUnderlinePlugin,
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

    // Process HTML with the same importer pipeline.
    const { html: preprocessedHtml } = preprocessMammothHtml(
      mammothResult.value
    );
    const cleanedHtml = cleanDocx(preprocessedHtml, '');

    // Deserialize HTML to nodes
    const doc = new DOMParser().parseFromString(cleanedHtml, 'text/html');
    const nodes = editor.api.html.deserialize({
      element: doc.body,
    });

    expect(nodes).toEqual(expected.children);
  });
};
