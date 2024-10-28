/** @jsx jsx */

import { createSlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { MarkdownPlugin } from '../../MarkdownPlugin';
import { deserializeMd } from './deserializeMd';

jsx;

describe('deserializeMd', () => {
  const editor = createSlateEditor({
    plugins: [MarkdownPlugin.configure({ options: { keepLineBreak: true } })],
  });

  it('should deserialize paragraphs and keep in separate paragraphs with line breaks', () => {
    const input =
      'Paragraph 1 line 1\nParagraph 1 line 2\n\nParagraph 2 line 1';

    const output = (
      <fragment>
        <hp>Paragraph 1 line 1</hp>
        <hp>Paragraph 1 line 2</hp>
        <hp>
          <htext />
        </hp>
        <hp>Paragraph 2 line 1</hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize line break tags and keep in separate paragraphs', () => {
    const input = 'Line 1<br>Line 2';
    const output = (
      <fragment>
        <hp>
          <htext>Line 1</htext>
        </hp>
        <hp>
          <htext>Line 2</htext>
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('multiple line breaks in the middle and the leading and trailing replacement lines should be preserved', () => {
    const input = '\n\nLine 1\n\nLine 2\n\n\nLine 3\n\n';

    const output = (
      <fragment>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext>Line 1</htext>
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext>Line 2</htext>
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext>Line 3</htext>
        </hp>
        <hp>
          <htext />
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('multiple line break tags in the middle and the leading and trailing replacement lines should be preserved', () => {
    const input = '<br><br>Line 1<br><br>Line 2<br><br><br>Line 3<br><br>';

    const output = (
      <fragment>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext>Line 1</htext>
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext>Line 2</htext>
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext>Line 3</htext>
        </hp>
        <hp>
          <htext />
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('a string containing <br> and \n should be parsed as separate paragraphs', () => {
    const input = '<br>Line 1\n<br>Line 2<br>\n<br>Line 3\n<br>';

    const output = (
      <fragment>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext>Line 1</htext>
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext>Line 2</htext>
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext>Line 3</htext>
        </hp>
        <hp>
          <htext />
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });
});
