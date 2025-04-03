/** @jsx jsxt */

import { createSlateEditor } from '@udecode/plate';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { jsxt } from '@udecode/plate-test-utils';

import { createTestEditor } from '../__tests__/createTestEditor';
import { MarkdownPlugin } from '../MarkdownPlugin';
import { deserializeMd } from './deserializeMd';

jsxt;
const editor = createTestEditor();

describe('deserializeMd', () => {
  it('should deserialize strikethrough', () => {
    const input = 'This is ~~strikethrough~~.';

    const output = (
      <fragment>
        <hp>
          This is <htext strikethrough>strikethrough</htext>.
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  // Not sure if this is correct
  it('should deserialize >>> to blockquote', () => {
    const input = '>>>a';

    const output = (
      <fragment>
        <hblockquote>
          <htext>a</htext>
        </hblockquote>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize empty blockquotes', () => {
    const input = '>';

    const output = (
      <fragment>
        <hblockquote>
          <htext />
        </hblockquote>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize "> " as blockquotes', () => {
    const input = '> Blockquote content';

    const output = (
      <fragment>
        <hblockquote>Blockquote content</hblockquote>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize paragraphs', () => {
    const input =
      'Paragraph 1 line 1\nParagraph 1 line 2\n\nParagraph 2 line 1';

    const output = (
      <fragment>
        <hp>
          Paragraph 1 line 1{'\n'}
          Paragraph 1 line 2
        </hp>
        <hp>Paragraph 2 line 1</hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize blockquotes', () => {
    const input =
      '> Blockquote 1 line 1\n> Blockquote 1 line 2\n\n> Blockquote 2 line 1';

    const output = (
      <fragment>
        <hblockquote>
          Blockquote 1 line 1{'\n'}
          Blockquote 1 line 2
        </hblockquote>
        <hblockquote>Blockquote 2 line 1</hblockquote>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize blockquote with links', () => {
    const input = '> [Example link](https://example.com)';

    const output = (
      <fragment>
        <hblockquote>
          <ha url="https://example.com">Example link</ha>
        </hblockquote>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize links', () => {
    const input = '[Example link](https://example.com)';

    const output = (
      <fragment>
        <hp>
          <ha url="https://example.com">Example link</ha>
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize inline code', () => {
    const input = 'This is `inline code`.';

    const output = (
      <fragment>
        <hp>
          This is <htext code>inline code</htext>.
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize italic', () => {
    const input = 'This is *italic*.';

    const output = (
      <fragment>
        <hp>
          This is <htext italic>italic</htext>.
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize bold', () => {
    const input = 'This is **bold**.';

    const output = (
      <fragment>
        <hp>
          This is <htext bold>bold</htext>.
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize strikethrough', () => {
    const input =
      'This is ~~strikethrough~~ text and **~~strike~~ inside bold**.';

    const output = (
      <fragment>
        <hp>
          This is <htext strikethrough>strikethrough</htext> text and{' '}
          <htext bold strikethrough>
            strike
          </htext>
          <htext bold> inside bold</htext>.
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize nested marks', () => {
    const input = 'This is **bold *italic***.';

    const output = (
      <fragment>
        <hp>
          This is <htext bold>bold </htext>
          <htext bold italic>
            italic
          </htext>
          .
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should not parse marks inside inline code', () => {
    const input = 'This is `not **bold**`.';

    const output = (
      <fragment>
        <hp>
          This is <htext code>not **bold**</htext>.
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize images', () => {
    const input = 'No ![inline](https://example.com/example.png) images';

    const output = (
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
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize code blocks', () => {
    const input =
      '```\nCode block 1 line 1\nCode block 1 line 2\n```\n\n```\nCode block 2 line 1\n```';

    const output = (
      <fragment>
        <hcodeblock>
          <hcodeline>Code block 1 line 1</hcodeline>
          <hcodeline>Code block 1 line 2</hcodeline>
        </hcodeblock>
        <hcodeblock>
          <hcodeline>Code block 2 line 1</hcodeline>
        </hcodeblock>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should not parse marks inside code blocks', () => {
    const input = '```\nThis is not **bold**.\n```';

    const output = (
      <fragment>
        <hcodeblock>
          <hcodeline>This is not **bold**.</hcodeline>
        </hcodeblock>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize hr', () => {
    const input = 'Line 1\n\n---\n\nLine 2';

    const output = (
      <fragment>
        <hp>Line 1</hp>
        <element type={HorizontalRulePlugin.key}>
          <htext />
        </element>
        <hp>Line 2</hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize headings', () => {
    const input = Array.from(
      { length: 6 },
      (_, i) => `${'#'.repeat(i + 1)} Heading ${i + 1}`
    ).join('\n\n');

    const output = (
      <fragment>
        <hh1>Heading 1</hh1>
        <hh2>Heading 2</hh2>
        <hh3>Heading 3</hh3>
        <hh4>Heading 4</hh4>
        <hh5>Heading 5</hh5>
        <hh6>Heading 6</hh6>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize line break tags', () => {
    const input = 'Line 1<br />Line 2';

    const output = (
      <fragment>
        <hp>
          <htext>Line 1</htext>
          <htext>{'\n'}</htext>
          <htext>Line 2</htext>
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });
});

describe('deserializeMd list', () => {
  it('should deserialize unordered lists', () => {
    const input = '- List item 1\n- List item 2';

    const output = (
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
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize ordered lists', () => {
    const input = '1. List item 1\n2. List item 2';

    const output = (
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
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize mixed nested lists', () => {
    const input = '- List item 1\n  1. List item 1.1';

    const output = (
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
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });
});

describe('deserializeMd table', () => {
  it('should deserialize a table', () => {
    const input = `
| Left columns  | Right columns |
| ------------- |:-------------:|
| left foo      | right foo     |
| left bar      | right bar     |
| left baz      | right baz     |
`;

    const output = (
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

    expect(deserializeMd(editor, input)).toEqual(output);
  });
});

describe('deserializeMd options', () => {
  const editor = createSlateEditor({
    plugins: [MarkdownPlugin],
  });

  describe('when memoize is true', () => {
    it('should add _memo property to elements', () => {
      const input = '# Heading\n> Quote\n```\nCode\n```';

      const output = [
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
      ];

      expect(deserializeMd(editor, input, { memoize: true })).toEqual(output);
    });
  });
});

describe('fixures', () => {
  // https://github.com/inokawa/remark-slate-transformer/issues/129
  it('when deserializing a empty value', () => {
    const input = '';

    expect(deserializeMd(editor, input)).toMatchSnapshot();
  });
});
