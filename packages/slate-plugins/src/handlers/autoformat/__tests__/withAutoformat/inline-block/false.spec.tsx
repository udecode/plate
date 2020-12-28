/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { withReact } from 'slate-react';
import { ELEMENT_CODE_BLOCK } from '../../../../../elements/code-block/defaults';
import { withAutoformat } from '../../../withAutoformat';

const input = (
  <editor>
    <hp>
      ``
      <cursor />
      hello
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>```hello</hp>
  </editor>
) as any;

it('should run default', () => {
  const editor = withAutoformat({
    rules: [
      {
        trigger: '`',
        type: ELEMENT_CODE_BLOCK,
        markup: '///',
        mode: 'inline-block',
      },
    ],
  })(withReact(input));

  editor.insertText('`');

  expect(input.children).toEqual(output.children);
});
