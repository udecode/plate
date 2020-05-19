/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withReact } from 'slate-react';
import { withMention } from 'elements';

const input = (
  <editor>
    <hp><cursor/></hp>
  </editor>
) as any;


const output = (
  <editor>
    <hp>
      <element type='mention' prefix='@' mentionable={{value: "Count Duku"}}>{{ text: ''}}</element>
    </hp>
  </editor>
) as any;

it('should insert mention', () => {
  const editor = withMention()(withReact(input));

  editor.insertNode({
    type: 'mention',
    prefix: '@',
    mentionable: { value: 'Count Duku'},
    children: [{ text: '' }],
  });

  expect(input.children).toEqual(output.children);
});
