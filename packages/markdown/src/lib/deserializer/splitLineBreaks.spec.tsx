/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createTestEditor } from '../__tests__/createTestEditor';
import { deserializeMd } from './deserializeMd';

jsxt;

describe('when splitLineBreaks is enabled', () => {
  const editor = createTestEditor();

  it.each([
    {
      input: 'Paragraph 1 line 1\nParagraph 1 line 2\n\nParagraph 2 line 1',
      output: (
        <fragment>
          <hp>Paragraph 1 line 1</hp>
          <hp>Paragraph 1 line 2</hp>
          <hp>
            <htext />
          </hp>
          <hp>Paragraph 2 line 1</hp>
        </fragment>
      ),
      title: 'splits markdown line breaks into separate paragraphs',
    },
    {
      input: 'Line 1<br>Line 2',
      output: (
        <fragment>
          <hp>Line 1</hp>
          <hp>Line 2</hp>
        </fragment>
      ),
      title: 'splits html line break tags into separate paragraphs',
    },
    {
      input: '\n\nLine 1\n\nLine 2\n\n\nLine 3\n\n',
      output: (
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
      ),
      title: 'preserves consecutive markdown line breaks as empty paragraphs',
    },
    {
      input: '<br><br>Line 1<br><br>Line 2<br><br><br>Line 3<br><br>',
      output: (
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
      ),
      title: 'preserves consecutive html line break tags as empty paragraphs',
    },
  ])('$title', ({ input, output }) => {
    expect(deserializeMd(editor, input, { splitLineBreaks: true })).toEqual(
      output
    );
  });
});
