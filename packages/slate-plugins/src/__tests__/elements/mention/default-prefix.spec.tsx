/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withMention } from 'elements';
import { withReact } from 'slate-react';

const input = (
  <editor>
    <hp>
      <cursor />
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      <htext />
      <element type="mention" prefix="@" mentionable={{ value: 'Count Duku' }}>
        <htext />
      </element>
      <htext />
    </hp>
  </editor>
) as any;

it('should insert mention', () => {
  const editor = withMention()(withReact(input));

  editor.insertNode({
    type: 'mention',
    prefix: '@',
    mentionable: { value: 'Count Duku' },
    children: [{ text: '' }],
  });

  expect(input.children).toEqual(output.children);
});
