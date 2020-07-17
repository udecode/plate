/** @jsx jsx */

import { withReact } from 'slate-react';
import { jsx } from '../../../../../../__test-utils__/jsx';
import { MARK_ITALIC } from '../../../../../../marks/italic/defaults';
import { withAutoformat } from '../../../../withAutoformat';

const input = (
  <editor>
    <hp>
      *hello
      <cursor />
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      <htext italic>hello</htext>
    </hp>
  </editor>
) as any;

it('should autoformat', () => {
  const editor = withAutoformat({
    rules: [
      {
        trigger: '*',
        type: MARK_ITALIC,
        markup: '*',
        mode: 'inline',
      },
    ],
  })(withReact(input));

  editor.insertText('*');

  expect(input.children).toEqual(output.children);
});
