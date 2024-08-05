/** @jsx jsx */

import { createPlugin } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { autoformatPlugin } from 'www/src/lib/plate/demo/plugins/autoformatPlugin';

import { withAutoformat } from '../../../withAutoformat';

jsx;

const input = (
  <editor>
    <hp>
      `hello
      <cursor />
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      <htext code>hello</htext>
    </hp>
  </editor>
) as any;

it('should autoformat', () => {
  const editor = withAutoformat(
    withReact(input),
    createPlugin(autoformatPlugin as any)
  );

  editor.insertText('`');

  expect(input.children).toEqual(output.children);
});
