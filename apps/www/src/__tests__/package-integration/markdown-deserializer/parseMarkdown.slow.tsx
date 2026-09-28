/** @jsx jsxt */
import { jsxt } from '@platejs/test';
import { BaseHorizontalRulePlugin } from 'platejs';
import type { MarkdownParsePolicy } from 'platejs/markdown';

import { createTestEditor } from '../../../../../../packages/platejs/src/markdown/lib/__tests__/createTestEditor';

jsxt;

const editor = createTestEditor();
const parseMarkdown = (
  input: string,
  currentEditor = editor,
  options?: MarkdownParsePolicy
) => {
  const result = currentEditor.api.markdown.parse(input, options);

  if (!result.ok) throw new Error(result.diagnostics[0].message);

  return result.document.children;
};

describe('editor.api.markdown.parse', () => {
  describe('inline content', () => {
    it.each([
      {
        input: 'This is ~~strikethrough~~.',
        name: 'parses strikethrough marks',
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
        name: 'parses bold marks',
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
        name: 'parses italic marks',
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
        name: 'parses nested marks',
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
        name: 'parses kbd html tags',
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

    it('keeps literal doctype text as diagnosed raw HTML', () => {
      const result = editor.api.markdown.parse('<!DOCTYPE', {
        lossPolicy: 'allow',
      });

      expect(result).toMatchObject({
        diagnostics: [
          expect.objectContaining({
            code: 'markdown-unsupported-node',
            nodeType: 'html',
          }),
        ],
        document: { children: [{ children: [{ text: '<!DOCTYPE' }] }] },
        ok: true,
      });
    });
  });

  describe('blockquotes', () => {
    it.each([
      {
        input: '>',
        name: 'parses an empty blockquote',
        output: (
          <fragment>
            <hblockquote>
              <hp>
                <htext />
              </hp>
            </hblockquote>
          </fragment>
        ),
      },
      {
        input: '> Blockquote content',
        name: 'parses a single blockquote line',
        output: (
          <fragment>
            <hblockquote>
              <hp>Blockquote content</hp>
            </hblockquote>
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
              <hp>Blockquote paragraph1</hp>
              <hp>Blockquote paragraph2</hp>
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
              <hp>
                <htext>{'Blockquote line1\nBlockquote line2'}</htext>
              </hp>
            </hblockquote>
          </fragment>
        ),
      },
      {
        input: '> [Example link](https://example.com)',
        name: 'parses links inside blockquotes',
        output: (
          <fragment>
            <hblockquote>
              <hp>
                <htext />
                <ha url="https://example.com">Example link</ha>
                <htext />
              </hp>
            </hblockquote>
          </fragment>
        ),
      },
      {
        input: `> some thing is reference
> - aaa
> - bbb`,
        name: 'parses lists inside blockquotes as nested block content',
        output: (
          <fragment>
            <hblockquote>
              <hp>some thing is reference</hp>
              <hp indent={1} listType="bulleted">
                aaa
              </hp>
              <hp indent={1} listType="bulleted">
                bbb
              </hp>
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
        name: 'parses paragraph breaks',
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
        name: 'parses inline images into block image nodes',
        output: (
          <fragment>
            <hp>No </hp>
            <himg alt="inline" url="https://example.com/example.png">
              <htext />
            </himg>
            <hp> images</hp>
          </fragment>
        ),
      },
      {
        input:
          '```\nCode block 1 line 1\nCode block 1 line 2\n```\n\n```\nCode block 2 line 1\n```',
        name: 'parses fenced code blocks',
        output: (
          <fragment>
            <hcodeblock>
              Code block 1 line 1{'\n'}Code block 1 line 2
            </hcodeblock>
            <hcodeblock>Code block 2 line 1</hcodeblock>
          </fragment>
        ),
      },
      {
        input: 'Line 1\n\n---\n\nLine 2',
        name: 'parses horizontal rules',
        output: (
          <fragment>
            <hp>Line 1</hp>
            <element type={editor.plugin(BaseHorizontalRulePlugin).schema.type}>
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
        name: 'parses heading levels',
        output: (
          <fragment>
            <hheading level={1}>Heading 1</hheading>
            <hheading level={2}>Heading 2</hheading>
            <hheading level={3}>Heading 3</hheading>
            <hheading level={4}>Heading 4</hheading>
            <hheading level={5}>Heading 5</hheading>
            <hheading level={6}>Heading 6</hheading>
          </fragment>
        ),
      },
      {
        input: 'Line 1<br />Line 2',
        name: 'parses line break tags',
        output: (
          <fragment>
            <hp>
              <htext>{'Line 1\nLine 2'}</htext>
            </hp>
          </fragment>
        ),
      },
    ])('$name', ({ input, output }) => {
      expect(parseMarkdown(input)).toEqual(output);
    });
  });

  describe('tables', () => {
    it('parses markdown tables', () => {
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
        input: '1 [User](mention:User) and',
        name: 'parses link mentions inside a paragraph',
        output: (
          <fragment>
            <hp>
              <htext>1 </htext>
              <hmention ref="User">
                <htext />
              </hmention>
              <htext> and</htext>
            </hp>
          </fragment>
        ),
      },
      {
        input: '1 @User',
        name: 'keeps bare @handles as text',
        output: (
          <fragment>
            <hp>
              <htext>1 @User</htext>
            </hp>
          </fragment>
        ),
      },
    ])('$name', ({ input, output }) => {
      expect(parseMarkdown(input)).toEqual(output);
    });
  });

  describe('fixtures', () => {
    it('returns the schema default block for an empty markdown string', () => {
      expect(parseMarkdown('')).toEqual([
        {
          children: [{ text: '' }],
          type: 'paragraph',
        },
      ]);
    });

    it('parses an image nested inside a list item', () => {
      const result = editor.api.markdown.parse(
        '- ![alt text](https://example.com/image.png)'
      );

      expect(result.ok).toBe(true);
      if (!result.ok) throw new Error(result.diagnostics[0].message);

      expect(result.document.children).toEqual([
        {
          alt: 'alt text',
          children: [{ text: '' }],
          indent: 1,
          listType: 'bulleted',
          type: 'image',
          url: 'https://example.com/image.png',
        },
      ]);

      const serialized = editor.api.markdown.serialize({
        document: result.document,
      });

      expect(serialized.ok).toBe(true);
      if (!serialized.ok) throw new Error(serialized.diagnostics[0].message);

      expect(editor.api.markdown.parse(serialized.data)).toMatchObject({
        document: result.document,
        ok: true,
      });
    });
  });
});
