/** @jsx jsx */

import { withReact } from 'slate-react';
import { jsx } from '../../../../../__test-utils__/jsx';
import { CODE_BLOCK } from '../../../../../elements/code-block/types';
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
      { trigger: '`', type: CODE_BLOCK, markup: '///', mode: 'inline-block' },
    ],
  })(withReact(input));

  editor.insertText('`');

  expect(input.children).toEqual(output.children);
});
