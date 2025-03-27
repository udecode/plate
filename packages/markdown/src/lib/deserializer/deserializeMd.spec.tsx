/** @jsx jsxt */

import { createSlateEditor } from '@udecode/plate';
import { BaseHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { jsxt } from '@udecode/plate-test-utils';

import { deserializeMd } from './deserializeMd';

const editor = createSlateEditor();

jsxt;

describe('deserializeMd', () => {
  it('should deserialize paragraph', () => {
    const result = deserializeMd(editor, 'Hello, world!');

    const output = (
      <editor>
        <hp>Hello, world!</hp>
      </editor>
    ) as any;

    expect(result).toEqual(output.children);
  });

  it('should deserialize link', () => {
    const result = deserializeMd(
      editor,
      '[Hello, world!](https://example.com)'
    );

    const output = (
      <editor>
        <hp>
          <ha url="https://example.com">Hello, world!</ha>
        </hp>
      </editor>
    ) as any;

    expect(result).toEqual(output.children);
  });

  it('should deserialize blockquote', () => {
    const result = deserializeMd(editor, '> Hello, world!');

    const output = (
      <editor>
        <hblockquote>
          <hp>Hello, world!</hp>
        </hblockquote>
      </editor>
    ) as any;

    expect(result).toEqual(output.children);
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

  it('should deserialize hr', () => {
    const input = 'Line 1\n\n---\n\nLine 2';

    const output = (
      <fragment>
        <hp>Line 1</hp>
        <element type={BaseHorizontalRulePlugin.key}>
          <htext />
        </element>
        <hp>Line 2</hp>
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
});

describe('deserializeMd equation', () => {
  it('should deserialize block equation', () => {
    const input = `$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$`;

    const output = (
      <fragment>
        <hequation texExpression="\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}">
          <htext />
        </hequation>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize inline equation', () => {
    const input = `$E=mc^2$ `;

    const output = (
      <fragment>
        <hp>
          <hinlineequation texExpression="E=mc^2">
            <htext />
          </hinlineequation>
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });
});
