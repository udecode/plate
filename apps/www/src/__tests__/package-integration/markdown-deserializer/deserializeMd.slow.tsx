/** @jsx jsxt */
import { HorizontalRulePlugin } from '@platejs/basic-nodes/react';
import { BaseListPlugin } from '@platejs/list-classic';
import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import { createTestEditor } from '../../../../../../packages/markdown/src/lib/__tests__/createTestEditor';
import { MarkdownPlugin } from '../../../../../../packages/markdown/src/lib/MarkdownPlugin';
import { deserializeMd } from '../../../../../../packages/markdown/src/lib/deserializer/deserializeMd';
jsxt;

const editor = createTestEditor();
const listEditor = createSlateEditor({
  plugins: [BaseListPlugin, MarkdownPlugin],
});

const parseMarkdown = (
  input: string,
  currentEditor = editor,
  options?: Parameters<typeof deserializeMd>[2]
) => deserializeMd(currentEditor, input, options);

describe('deserializeMd', () => {
  describe('inline content', () => {
    it.each([
      {
        input: '<!DOCTYPE',
        name: 'keeps literal doctype text',
        output: (
          <fragment>
            <hp>
              <htext>{'<!DOCTYPE'}</htext>
            </hp>
          </fragment>
        ),
      },
      {
        input: 'This is ~~strikethrough~~.',
        name: 'deserializes strikethrough marks',
        output: (
          <fragment>
            <hp>
              This is <htext strikethrough>strikethrough</htext>.
            </hp>
          </fragment>
        ),
      },
      {
        input: 'This is **bold**.',
        name: 'deserializes bold marks',
        output: (
          <fragment>
            <hp>
              This is <htext bold>bold</htext>.
            </hp>
          </fragment>
        ),
      },
      {
        input: 'This is *italic*.',
        name: 'deserializes italic marks',
        output: (
          <fragment>
            <hp>
              This is <htext italic>italic</htext>.
            </hp>
          </fragment>
        ),
      },
      {
        input: 'This is **bold *italic***.',
        name: 'deserializes nested marks',
        output: (
          <fragment>
            <hp>
              This is <htext bold>bold </htext>
              <htext bold italic>
                italic
              </htext>
              .
            </hp>
          </fragment>
        ),
      },
      {
        input: 'This is `not **bold**`.',
        name: 'does not parse marks inside inline code',
        output: (
          <fragment>
            <hp>
              This is <htext code>not **bold**</htext>.
            </hp>
          </fragment>
        ),
      },
      {
        input: '<kbd>Ctrl</kbd> + <kbd>K</kbd>',
        name: 'deserializes kbd html tags',
        output: (
          <fragment>
            <hp>
              <htext kbd>Ctrl</htext>
              <htext> + </htext>
              <htext kbd>K</htext>
            </hp>
          </fragment>
        ),
      },
    ])('$name', ({ input, output }) => {
      expect(parseMarkdown(input)).toEqual(output);
    });
  });

  describe('blockquotes', () => {
    it.each([
      {
        input: '>',
        name: 'deserializes an empty blockquote',
        output: (
          <fragment>
            <hblockquote>
              <htext />
            </hblockquote>
          </fragment>
        ),
      },
      {
        input: '> Blockquote content',
        name: 'deserializes a single blockquote line',
        output: (
          <fragment>
            <hblockquote>Blockquote content</hblockquote>
          </fragment>
        ),
      },
      {
        input: `> Blockquote paragraph1
>
> Blockquote paragraph2`,
        name: 'preserves paragraph breaks inside blockquotes',
        output: (
          <fragment>
            <hblockquote>
              <htext>Blockquote paragraph1</htext>
              <htext>{'\n'}</htext>
              <htext>{'\n'}</htext>
              <htext>Blockquote paragraph2</htext>
            </hblockquote>
          </fragment>
        ),
      },
      {
        input: `
> Blockquote line1<br>
> Blockquote line2`,
        name: 'collapses html breaks inside blockquotes to a single line break',
        output: (
          <fragment>
            <hblockquote>
              <htext>Blockquote line1</htext>
              <htext>{'\n'}</htext>
              <htext>Blockquote line2</htext>
            </hblockquote>
          </fragment>
        ),
      },
      {
        input: '> [Example link](https://example.com)',
        name: 'deserializes links inside blockquotes',
        output: (
          <fragment>
            <hblockquote>
              <ha url="https://example.com">Example link</ha>
            </hblockquote>
          </fragment>
        ),
      },
    ])('$name', ({ input, output }) => {
      expect(parseMarkdown(input)).toEqual(output);
    });
  });

  describe('blocks and rich nodes', () => {
    it.each([
      {
        input: `
Paragraph 1 line 1
Paragraph 1 line 2

Paragraph 2 line 1`,
        name: 'deserializes paragraph breaks',
        output: (
          <fragment>
            <hp>
              Paragraph 1 line 1{'\n'}
              Paragraph 1 line 2
            </hp>
            <hp>Paragraph 2 line 1</hp>
          </fragment>
        ),
      },
      {
        input: 'No ![inline](https://example.com/example.png) images',
        name: 'deserializes inline images into block image nodes',
        output: (
          <fragment>
            <hp>No </hp>
            <himg
              caption={
                <fragment>
                  <htext>inline</htext>
                </fragment>
              }
              url="https://example.com/example.png"
            >
              <htext />
            </himg>
            <hp> images</hp>
          </fragment>
        ),
      },
      {
        input:
          '```\nCode block 1 line 1\nCode block 1 line 2\n```\n\n```\nCode block 2 line 1\n```',
        name: 'deserializes fenced code blocks',
        output: (
          <fragment>
            <hcodeblock>
              <hcodeline>Code block 1 line 1</hcodeline>
              <hcodeline>Code block 1 line 2</hcodeline>
            </hcodeblock>
            <hcodeblock>
              <hcodeline>Code block 2 line 1</hcodeline>
            </hcodeblock>
          </fragment>
        ),
      },
      {
        input: 'Line 1\n\n---\n\nLine 2',
        name: 'deserializes horizontal rules',
        output: (
          <fragment>
            <hp>Line 1</hp>
            <element type={HorizontalRulePlugin.key}>
              <htext />
            </element>
            <hp>Line 2</hp>
          </fragment>
        ),
      },
      {
        input: Array.from(
          { length: 6 },
          (_, index) => `${'#'.repeat(index + 1)} Heading ${index + 1}`
        ).join('\n\n'),
        name: 'deserializes heading levels',
        output: (
          <fragment>
            <hh1>Heading 1</hh1>
            <hh2>Heading 2</hh2>
            <hh3>Heading 3</hh3>
            <hh4>Heading 4</hh4>
            <hh5>Heading 5</hh5>
            <hh6>Heading 6</hh6>
          </fragment>
        ),
      },
      {
        input: 'Line 1<br />Line 2',
        name: 'deserializes line break tags',
        output: (
          <fragment>
            <hp>
              <htext>Line 1</htext>
              <htext>{'\n'}</htext>
              <htext>Line 2</htext>
            </hp>
          </fragment>
        ),
      },
    ])('$name', ({ input, output }) => {
      expect(parseMarkdown(input)).toEqual(output);
    });
  });

  describe('lists and tables', () => {
    it.each([
      {
        input: '- List item 1\n- List item 2',
        name: 'deserializes unordered lists',
        output: (
          <fragment>
            <hul>
              <hli>
                <hlic>List item 1</hlic>
              </hli>
              <hli>
                <hlic>List item 2</hlic>
              </hli>
            </hul>
          </fragment>
        ),
      },
      {
        input: '1. List item 1\n2. List item 2',
        name: 'deserializes ordered lists',
        output: (
          <fragment>
            <hol>
              <hli>
                <hlic>List item 1</hlic>
              </hli>
              <hli>
                <hlic>List item 2</hlic>
              </hli>
            </hol>
          </fragment>
        ),
      },
      {
        input: '- List item 1\n  1. List item 1.1',
        name: 'deserializes nested mixed lists',
        output: (
          <fragment>
            <hul>
              <hli>
                <hlic>List item 1</hlic>
                <hol>
                  <hli>
                    <hlic>List item 1.1</hlic>
                  </hli>
                </hol>
              </hli>
            </hul>
          </fragment>
        ),
      },
      {
        input: 'foo\n\n*\n\nbar',
        name: 'deserializes empty list items with list item content',
        output: (
          <fragment>
            <hp>foo</hp>
            <hul>
              <hli>
                <hlic>
                  <htext />
                </hlic>
              </hli>
            </hul>
            <hp>bar</hp>
          </fragment>
        ),
      },
    ])('$name', ({ input, output }) => {
      expect(parseMarkdown(input, listEditor as any)).toEqual(output);
    });

    it('deserializes markdown tables', () => {
      const input = `
| Left columns  | Right columns |
| ------------- |:-------------:|
| left foo      | right foo     |
| left bar      | right bar     |
| left baz      | right baz     |
`;

      expect(parseMarkdown(input)).toEqual(
        <fragment>
          <htable>
            <htr>
              <hth>
                <hp>Left columns</hp>
              </hth>
              <hth>
                <hp>Right columns</hp>
              </hth>
            </htr>
            <htr>
              <htd>
                <hp>left foo</hp>
              </htd>
              <htd>
                <hp>right foo</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>left bar</hp>
              </htd>
              <htd>
                <hp>right bar</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>left baz</hp>
              </htd>
              <htd>
                <hp>right baz</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      );
    });
  });

  describe('mentions and options', () => {
    it.each([
      {
        input: '1 @User',
        name: 'deserializes mentions inside a paragraph',
        output: (
          <fragment>
            <hp>
              <htext>1 </htext>
              <hmention value="User">
                <htext />
              </hmention>
            </hp>
          </fragment>
        ),
      },
      {
        input: '@User',
        name: 'deserializes standalone mentions',
        output: (
          <fragment>
            <hp>
              <hmention value="User">
                <htext />
              </hmention>
            </hp>
          </fragment>
        ),
      },
    ])('$name', ({ input, output }) => {
      expect(parseMarkdown(input)).toEqual(output);
    });

    it('adds memoized source strings when memoize is enabled', () => {
      expect(
        parseMarkdown('# Heading\n> Quote\n```\nCode\n```', editor, {
          memoize: true,
        })
      ).toEqual([
        {
          _memo: '# Heading',
          children: [{ text: 'Heading' }],
          type: 'h1',
        },
        {
          _memo: '> Quote',
          children: [{ text: 'Quote' }],
          type: 'blockquote',
        },
        {
          _memo: '```\nCode\n```',
          children: [
            {
              children: [{ text: 'Code' }],
              type: 'code_line',
            },
          ],
          type: 'code_block',
        },
      ]);
    });
  });

  describe('fixtures', () => {
    it('returns an empty array for an empty markdown string', () => {
      expect(parseMarkdown('')).toEqual([]);
    });

    it('deserializes an image nested inside a list item', () => {
      expect(
        parseMarkdown('- ![alt text](https://example.com/image.png)')
      ).toEqual([
        {
          caption: [
            {
              text: 'alt text',
            },
          ],
          children: [
            {
              text: '',
            },
          ],
          indent: 1,
          listStyleType: 'disc',
          type: 'img',
          url: 'https://example.com/image.png',
        },
      ]);
    });
  });
});
