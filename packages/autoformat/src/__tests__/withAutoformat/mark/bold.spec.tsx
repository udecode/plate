/** @jsx jsx */

import { withAutoformat } from '@/packages/autoformat/src/withAutoformat';
import { autoformatPlugin } from '@/plate/demo/plugins/autoformatPlugin';
import { mockPlugin } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';

jsx;

const input = (
  <editor>
    <hp>
      **hello
      <cursor />
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      <htext bold>hello</htext>
    </hp>
  </editor>
) as any;

it('should autoformat', () => {
  const editor = withAutoformat(
    withReact(input),
    mockPlugin(autoformatPlugin as any)
  );

  editor.insertText('*');
  editor.insertText('*');

  expect(input.children).toEqual(output.children);
});
