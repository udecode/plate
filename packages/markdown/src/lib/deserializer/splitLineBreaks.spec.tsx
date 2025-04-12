/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTestEditor } from '../__tests__/createTestEditor';
import { deserializeMd } from './deserializeMd';

jsxt;

describe('when splitLineBreaks is enabled', () => {
  const editor = createTestEditor();

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

    expect(deserializeMd(editor, input, { splitLineBreaks: true })).toEqual(
      output
    );
  });

  it('should deserialize line break tags and keep in separate paragraphs', () => {
    const input = 'Line 1<br>Line 2';
    const output = (
      <fragment>
        <hp>Line 1</hp>
        <hp>Line 2</hp>
      </fragment>
    );

    expect(deserializeMd(editor, input, { splitLineBreaks: true })).toEqual(
      output
    );
  });

  it('splits N consecutive line breaks into N paragraph breaks', () => {
    const input = '\n\nLine 1\n\nLine 2\n\n\nLine 3\n\n';

    const output = (
      <fragment>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>Line 1</hp>
        <hp>
          <htext />
        </hp>
        <hp>Line 2</hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>Line 3</hp>
        <hp>
          <htext />
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input, { splitLineBreaks: true })).toEqual(
      output
    );
  });

  it('splits N consecutive line break tags into N paragraph breaks', () => {
    const input = '<br><br>Line 1<br><br>Line 2<br><br><br>Line 3<br><br>';

    const output = (
      <fragment>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>Line 1</hp>
        <hp>
          <htext />
        </hp>
        <hp>Line 2</hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>Line 3</hp>
        <hp>
          <htext />
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input, { splitLineBreaks: true })).toEqual(
      output
    );
  });

  // broken by remark-mdx. but not sure if it important
  it.skip('allows mixing line breaks and line break tags', () => {
    const input = '<br>Line 1\n<br>Line 2<br>\n<br>Line 3\n<br>';

    const output = (
      <fragment>
        <hp>
          <htext />
        </hp>
        <hp>Line 1</hp>
        <hp>
          <htext />
        </hp>
        <hp>Line 2</hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>Line 3</hp>
        <hp>
          <htext />
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input, { splitLineBreaks: true })).toEqual(
      output
    );
  });
});
