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
import type { BasePlugins } from '@platejs/core';
import {
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import { property, schema } from '@platejs/plite';
import { jsx, type TestEditor } from '@platejs/test-utils';
import { KEYS } from '@platejs/utils';

import { DocxIOPlugin } from './DocxIOPlugin';

void jsx;

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

const readDocxFixture = (filename: string): Buffer => {
  const docxTestDir = path.resolve(
    __dirname,
    '../../../../apps/www/src/__tests__/package-integration/docx'
  );
  const filepath = path.join(docxTestDir, `${filename}.docx`);

  return fs.readFileSync(filepath);
};

const testDocxImporter = ({
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
        DocxIOPlugin,
      ],
    });

    const buffer = readDocxFixture(filename);
    const arrayBuffer = new ArrayBuffer(buffer.byteLength);
    new Uint8Array(arrayBuffer).set(buffer);

    const { nodes } = await editor.plugin(DocxIOPlugin).api.import(arrayBuffer);

    expect(nodes).toEqual(expected.children);
  });
};

describe('DocxIOPlugin fixture imports', () => {
  describe('block quotes', () => {
    testDocxImporter({
      expected: (
        <editor>
          <hh2>Some block quotes, in different ways</hh2>
          <hp>This is the proper way, with a style</hp>
          <hp>
            I don{'\u2019'}t know why this would be in italics, but so it
            appears to be on my screen.
          </hp>
          <hp>And this is the way that most people do it:</hp>
          <hp>
            I just indented this, so it looks like a block quote. I think this
            is how most people do block quotes in their documents.
          </hp>
          <hp>And back to the normal style.</hp>
        </editor>
      ),
      filename: 'block_quotes',
    });
  });

  describe('headers', () => {
    testDocxImporter({
      expected: (
        <editor>
          <hh1>A Test of Headers</hh1>
          <hh2>Second Level</hh2>
          <hp>Some plain text.</hp>
          <hh3>Third level</hh3>
          <hp>Some more plain text.</hp>
          <hh4>Fourth level</hh4>
          <hp>Some more plain text.</hp>
          <hh5>Fifth level</hh5>
          <hp>Some more plain text.</hp>
          <hh6>Sixth level</hh6>
          <hp>Some more plain text.</hp>
          <hp>Seventh level</hp>
          <hp>
            Since no Heading 7 style exists in styles.xml, this gets converted
            to Span.
          </hp>
        </editor>
      ),
      filename: 'headers',
    });
  });

  describe('inline formatting', () => {
    testDocxImporter({
      expected: (
        <editor>
          <hp>
            Regular text <htext italic>italics</htext> <htext bold>bold </htext>
            <htext bold italic>
              bold italics
            </htext>
            .
          </hp>
          <hp>
            This is Small Caps, and this is{' '}
            <htext strikethrough>strikethrough</htext>.
          </hp>
          <hp>
            Some people use single underlines for <htext italic>emphasis</htext>
            .
          </hp>
          <hp>
            Above the line is <htext script="sup">superscript</htext> and below
            the line is <htext script="sub">subscript</htext>.
          </hp>
          <hp>A line{'\n'}break.</hp>
        </editor>
      ),
      filename: 'inline_formatting',
    });
  });

  describe('links', () => {
    testDocxImporter({
      expected: (
        <editor>
          <hh2>An internal link and an external link</hh2>
          <hp>
            An{' '}
            <ha url="http://google.com" target="_blank">
              external link
            </ha>{' '}
            to a popular website.
          </hp>
          <hp>
            An{' '}
            <ha url="http://pandoc.org/README.html#synopsis" target="_blank">
              external link
            </ha>{' '}
            to a website with an anchor.
          </hp>
          <hp>
            An{' '}
            <ha url="#_A_section_for" target="_blank">
              internal link
            </ha>{' '}
            to a section header.
          </hp>
          <hp>
            An{' '}
            <ha url="#my_bookmark" target="_blank">
              internal link
            </ha>{' '}
            to a bookmark.
          </hp>
          <hh2>A section for testing link targets</hh2>
          <hp>A bookmark right here</hp>
        </editor>
      ),
      filename: 'links',
    });
  });

  describe('tables', () => {
    testDocxImporter({
      expected: (
        <editor>
          <hh2>A table, with and without a header row</hh2>
          <htable>
            <htr>
              <htd>
                <hp>Name</hp>
              </htd>
              <htd>
                <hp>Game</hp>
              </htd>
              <htd>
                <hp>Fame</hp>
              </htd>
              <htd>
                <hp>Blame</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>Lebron James</hp>
              </htd>
              <htd>
                <hp>Basketball</hp>
              </htd>
              <htd>
                <hp>Very High</hp>
              </htd>
              <htd>
                <hp>Leaving Cleveland</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>Ryan Braun</hp>
              </htd>
              <htd>
                <hp>Baseball</hp>
              </htd>
              <htd>
                <hp>Moderate</hp>
              </htd>
              <htd>
                <hp>Steroids</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>Russell Wilson</hp>
              </htd>
              <htd>
                <hp>Football</hp>
              </htd>
              <htd>
                <hp>High</hp>
              </htd>
              <htd>
                <hp>Tacky uniform</hp>
              </htd>
            </htr>
          </htable>
          <htable>
            <htr>
              <htd>
                <hp>Sinple</hp>
              </htd>
              <htd>
                <hp>Table</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>Without</hp>
              </htd>
              <htd>
                <hp>Header</hp>
              </htd>
            </htr>
          </htable>
          <htable>
            <htr>
              <htd>
                <hp>Simple</hp>
                <hp>Multiparagraph</hp>
              </htd>
              <htd>
                <hp>Table</hp>
                <hp>Full</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>Of</hp>
                <hp>Paragraphs</hp>
              </htd>
              <htd>
                <hp>In each</hp>
                <hp>Cell.</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ),
      filename: 'tables',
    });
  });
});
