/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { withReact } from 'slate-react';
import { MARK_ITALIC } from '../../../../../../marks/basic-marks/src/italic/defaults';
import { withAutoformat } from '../../../../useAutoformatPlugin';

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
