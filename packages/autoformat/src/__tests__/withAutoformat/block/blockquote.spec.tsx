/** @jsx jsx */

import { autoformatPlugin } from '@/plate/demo/plugins/autoformatPlugin';
import { mockPlugin } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';

import { withAutoformat } from '../../../withAutoformat';

jsx;

const input = (
  <editor>
    <hp>
      {'>'}
      <cursor />
      hello
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hblockquote>hello</hblockquote>
  </editor>
) as any;

it('should autoformat', () => {
  const editor = withAutoformat(
    withReact(input),
    mockPlugin(autoformatPlugin as any)
  );

  editor.insertText(' ');

  expect(input.children).toEqual(output.children);
});
