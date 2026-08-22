/** @jsx jsx */

import fs from 'node:fs';
import path from 'node:path';

import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
  BaseItalicPlugin,
  BaseScriptPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from '@platejs/basic-nodes';
import type { BasePluginInput } from '@platejs/core';
import {
  BaseParagraphPlugin,
  createBaseEditor,
  defineBasePlugin,
} from '@platejs/core';
import { property, schema } from '@platejs/plite';
import { jsx, type TestEditor } from '@platejs/test-utils';
import { PLUGINS } from '@platejs/utils';

import { DocxImportPlugin } from './DocxImportPlugin';

void jsx;

const TestLinkPlugin = defineBasePlugin('link', {
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
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => {
          const url = element.getAttribute('href');

          if (!url) return undefined;

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

const TestTableRowPlugin = defineBasePlugin(PLUGINS.tableRow, {
  schema: () => ({
    element: {
      content: schema.content.element(TestTableCellPlugin, { min: 1 }),
    },
  }),
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        decodeOnly: true,
        match: [{ tag: 'tr' }],
      },
    }),
});

const TestTableCellPlugin = defineBasePlugin(PLUGINS.tableCell, {
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: BaseParagraphPlugin,
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

const TestTablePlugin = defineBasePlugin(PLUGINS.table, {
  dependencies: [TestTableRowPlugin, TestTableCellPlugin],
  schema: {
    element: {
      content: schema.content.element(TestTableRowPlugin, { min: 1 }),
    },
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
    import.meta.dirname,
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
  plugins?: readonly BasePluginInput[];
}) => {
  it('import', async () => {
    const editor = createBaseEditor({
      plugins: [
        ...plugins,
        BaseBlockquotePlugin,
        BaseHeadingPlugin,

        BaseHorizontalRulePlugin,
        BaseBoldPlugin,
        BaseCodePlugin,
        BaseItalicPlugin,
        BaseStrikethroughPlugin,
        BaseScriptPlugin,
        BaseUnderlinePlugin,
        TestLinkPlugin,
        TestTablePlugin,
        DocxImportPlugin,
      ],
    });

    const buffer = readDocxFixture(filename);
    const arrayBuffer = new ArrayBuffer(buffer.byteLength);
    new Uint8Array(arrayBuffer).set(buffer);

    const { nodes } = await editor
      .plugin(DocxImportPlugin)
      .api.import(arrayBuffer);

    expect(nodes).toEqual(expected.children);
  });
};

describe('DocxImportPlugin fixture imports', () => {
  describe('block quotes', () => {
    testDocxImporter({
      expected: (
        <editor>
          <hheading level={2}>Some block quotes, in different ways</hheading>
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
          <hheading level={1}>A Test of Headers</hheading>
          <hheading level={2}>Second Level</hheading>
          <hp>Some plain text.</hp>
          <hheading level={3}>Third level</hheading>
          <hp>Some more plain text.</hp>
          <hheading level={4}>Fourth level</hheading>
          <hp>Some more plain text.</hp>
          <hheading level={5}>Fifth level</hheading>
          <hp>Some more plain text.</hp>
          <hheading level={6}>Sixth level</hheading>
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
          <hheading level={2}>An internal link and an external link</hheading>
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
          <hheading level={2}>A section for testing link targets</hheading>
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
          <hheading level={2}>A table, with and without a header row</hheading>
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
