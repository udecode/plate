/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-common';
import { ELEMENT_HR } from '@udecode/plate-horizontal-rule';
import { jsx } from '@udecode/plate-test-utils';

import { createDeserializeMdPlugin } from '../DeserializeMdPlugin';
import { deserializeMd } from './deserializeMd';

jsx;

describe('deserializeMd', () => {
  const editor = createPlateEditor({
    plugins: [createDeserializeMdPlugin() as any],
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
        <element type={ELEMENT_HR}>
          <htext />
        </element>
        <hp>Line 2</hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

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
    const input = 'Line 1<br>Line 2';

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

describe('deserializeMdIndentList', () => {
  const editor = createPlateEditor({
    plugins: [
      createDeserializeMdPlugin({ options: { indentList: true } }) as any,
    ],
  });

  it('should deserialize unordered lists', () => {
    const input = '- List item 1\n- List item 2';

    const output = [
      {
        children: [
          {
            text: 'List item 1',
          },
        ],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [
          {
            text: 'List item 2',
          },
        ],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ];

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize ordered lists', () => {
    const input = '1. List item 1\n2. List item 2';

    const output = [
      {
        children: [
          {
            text: 'List item 1',
          },
        ],
        indent: 1,
        listStyleType: 'decimal',
        type: 'p',
      },
      {
        children: [
          {
            text: 'List item 2',
          },
        ],
        indent: 1,
        listStyleType: 'decimal',
        type: 'p',
      },
    ];

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize mixed nested lists', () => {
    const input = '- List item 1\n  1. List item 1.1';

    const output = [
      {
        children: [
          {
            text: 'List item 1',
          },
        ],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [
          {
            text: 'List item 1.1',
          },
        ],
        indent: 2,
        listStyleType: 'disc',
        type: 'p',
      },
    ];

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize an empty list item', () => {
    const input = '* Line 1\n*';

    const output = [
      {
        children: [
          {
            text: 'Line 1',
          },
        ],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ];

    expect(deserializeMd(editor, input)).toEqual(output);
  });
});
